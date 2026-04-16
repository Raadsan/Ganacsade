import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/api_response.dart';
import '../../shared/models/user.dart';
import '../../shared/models/product.dart';
import '../../shared/models/category.dart';
import '../../shared/models/cart.dart';

part 'api_service.g.dart';

@RestApi()
abstract class ApiService {
  factory ApiService(Dio dio, {String baseUrl}) = _ApiService;

  // Authentication endpoints
  @POST('/auth/login')
  Future<ApiResponse<User>> login(@Body() Map<String, dynamic> loginData);

  @POST('/auth/register')
  Future<ApiResponse<User>> register(@Body() Map<String, dynamic> registerData);

  @POST('/auth/logout')
  Future<ApiResponse<String>> logout();

  @GET('/auth/profile')
  Future<ApiResponse<User>> getProfile();

  // Product endpoints
  @GET('/products')
  Future<ApiResponse<List<Product>>> getProducts({
    @Query('category') String? category,
    @Query('search') String? search,
    @Query('page') int? page,
    @Query('limit') int? limit,
  });

  @GET('/products/{id}')
  Future<ApiResponse<Product>> getProduct(@Path('id') String id);

  @GET('/products/featured')
  Future<ApiResponse<List<Product>>> getFeaturedProducts();

  // Category endpoints
  @GET('/categories')
  Future<ApiResponse<List<Category>>> getCategories();

  @GET('/categories/{id}/products')
  Future<ApiResponse<List<Product>>> getCategoryProducts(@Path('id') String id);

  // Cart endpoints
  @GET('/cart')
  Future<ApiResponse<Cart>> getCart();

  @POST('/cart/add')
  Future<ApiResponse<Cart>> addToCart(@Body() Map<String, dynamic> cartItem);

  @PUT('/cart/update')
  Future<ApiResponse<Cart>> updateCartItem(@Body() Map<String, dynamic> cartItem);

  @DELETE('/cart/remove/{productId}')
  Future<ApiResponse<Cart>> removeFromCart(@Path('productId') String productId);

  @DELETE('/cart/clear')
  Future<ApiResponse<String>> clearCart();

  // Order endpoints (simplified for now)
  @POST('/orders')
  Future<ApiResponse<String>> createOrder(@Body() Map<String, dynamic> orderData);

  @GET('/orders')
  Future<ApiResponse<String>> getOrders();

  @GET('/orders/{id}')
  Future<ApiResponse<String>> getOrder(@Path('id') String id);
}
