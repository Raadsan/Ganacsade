import prisma from '../../lib/config/prisma.js';

const ALLOWED_SORT_FIELDS = ['created_at', 'rating', 'helpful_count'];

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC', rating } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {
      product_id: productId,
      is_approved: true,
      ...(rating ? { rating: parseInt(rating, 10) } : {}),
    };

    const [reviews, total, grouped, aggregate] = await Promise.all([
      prisma.product_reviews.findMany({
        where,
        include: {
          users: {
            select: { id: true, first_name: true, last_name: true },
          },
        },
        orderBy: [{ is_featured: 'desc' }, { [sortField]: orderDirection }],
        skip: offset,
        take: limitNum,
      }),
      prisma.product_reviews.count({ where }),
      prisma.product_reviews.groupBy({
        by: ['rating'],
        where: { product_id: productId, is_approved: true },
        _count: { rating: true },
      }),
      prisma.product_reviews.aggregate({
        where: { product_id: productId, is_approved: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    grouped.forEach((row) => {
      distribution[row.rating] = row._count.rating;
    });

    res.json({
      success: true,
      data: {
        reviews: reviews.map((review) => {
          const firstName = review.users?.first_name || '';
          const lastName = review.users?.last_name || '';
          return {
            id: review.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            isVerifiedPurchase: review.is_verified_purchase,
            isFeatured: review.is_featured,
            helpfulCount: review.helpful_count,
            notHelpfulCount: review.not_helpful_count,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            user: {
              id: review.users?.id,
              firstName,
              lastName,
              initials: `${firstName.charAt(0)}${lastName.charAt(0)}`,
              displayName: `${firstName} ${lastName}`.trim(),
            },
          };
        }),
        summary: {
          averageRating: Number((aggregate._avg.rating || 0).toFixed(1)),
          totalReviews: aggregate._count._all || 0,
          ratingDistribution: distribution,
        },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment, orderId } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const product = await prisma.products.findFirst({
      where: { id: productId, deleted_at: null },
      select: { id: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const existingReview = await prisma.product_reviews.findFirst({
      where: { product_id: productId, user_id: userId },
      select: { id: true },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    let isVerifiedPurchase = false;
    if (orderId) {
      const orderCheck = await prisma.orders.findFirst({
        where: { id: orderId, user_id: userId, status: 'delivered' },
        select: { id: true },
      });
      isVerifiedPurchase = !!orderCheck;
    } else {
      const purchaseCheck = await prisma.orders.findFirst({
        where: { user_id: userId, status: 'delivered', order_items: { some: { product_id: productId } } },
        select: { id: true },
      });
      isVerifiedPurchase = !!purchaseCheck;
    }

    const review = await prisma.product_reviews.create({
      data: {
        product_id: productId,
        user_id: userId,
        order_id: orderId || null,
        rating,
        title: title || null,
        comment: comment || null,
        is_verified_purchase: isVerifiedPurchase,
      },
    });

    const user = await prisma.users.findFirst({
      where: { id: userId },
      select: { first_name: true, last_name: true },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.is_verified_purchase,
          createdAt: review.created_at,
          user: {
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            displayName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    const review = await prisma.product_reviews.findFirst({
      where: { id, user_id: userId },
      select: { id: true },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it',
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const updated = await prisma.product_reviews.update({
      where: { id },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(comment !== undefined ? { comment } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await prisma.product_reviews.deleteMany({
      where: { id, user_id: userId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it',
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const voteReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean',
      });
    }

    const review = await prisma.product_reviews.findFirst({
      where: { id },
      select: { id: true, user_id: true },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own review',
      });
    }

    await prisma.$transaction(async (tx) => {
      const existingVote = await tx.review_helpful_votes.findUnique({
        where: { review_id_user_id: { review_id: id, user_id: userId } },
      });

      if (existingVote) {
        const oldVote = existingVote.is_helpful;
        if (oldVote === isHelpful) {
          await tx.review_helpful_votes.delete({
            where: { review_id_user_id: { review_id: id, user_id: userId } },
          });

          await tx.product_reviews.update({
            where: { id },
            data: isHelpful
              ? { helpful_count: { decrement: 1 } }
              : { not_helpful_count: { decrement: 1 } },
          });
        } else {
          await tx.review_helpful_votes.update({
            where: { review_id_user_id: { review_id: id, user_id: userId } },
            data: { is_helpful: isHelpful },
          });

          await tx.product_reviews.update({
            where: { id },
            data: isHelpful
              ? { helpful_count: { increment: 1 }, not_helpful_count: { decrement: 1 } }
              : { helpful_count: { decrement: 1 }, not_helpful_count: { increment: 1 } },
          });
        }
      } else {
        await tx.review_helpful_votes.create({
          data: { review_id: id, user_id: userId, is_helpful: isHelpful },
        });

        await tx.product_reviews.update({
          where: { id },
          data: isHelpful
            ? { helpful_count: { increment: 1 } }
            : { not_helpful_count: { increment: 1 } },
        });
      }
    });

    const updatedReview = await prisma.product_reviews.findFirst({
      where: { id },
      select: { helpful_count: true, not_helpful_count: true },
    });

    res.json({
      success: true,
      message: 'Vote recorded',
      data: {
        helpfulCount: updatedReview?.helpful_count || 0,
        notHelpfulCount: updatedReview?.not_helpful_count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
