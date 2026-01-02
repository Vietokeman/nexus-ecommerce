using Grpc.Core;
using Inventory.API.Services.Interfaces;
using Inventory.Grpc;

namespace Inventory.API.GrpcServices
{
    /// <summary>
    /// gRPC service implementation for stock operations
    /// Provides high-performance stock checking for other microservices
    /// </summary>
    public class StockGrpcService : StockProtoService.StockProtoServiceBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ILogger<StockGrpcService> _logger;

        public StockGrpcService(
            IInventoryService inventoryService,
            ILogger<StockGrpcService> logger)
        {
            _inventoryService = inventoryService ?? throw new ArgumentNullException(nameof(inventoryService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get stock for a single item via gRPC
        /// Called by: Basket.API when adding items to cart
        /// </summary>
        public override async Task<StockResponse> GetStock(StockRequest request, ServerCallContext context)
        {
            _logger.LogInformation("gRPC GetStock called for item: {ItemNo}", request.ItemNo);

            try
            {
                var stock = await _inventoryService.GetStockByItemAsync(request.ItemNo);

                var response = new StockResponse
                {
                    ItemNo = stock.ItemNo,
                    Quantity = stock.Quantity,
                    IsAvailable = stock.Quantity > 0
                };

                _logger.LogDebug("Stock for {ItemNo}: {Quantity}", stock.ItemNo, stock.Quantity);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stock for item: {ItemNo}", request.ItemNo);
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }

        /// <summary>
        /// Get stock for multiple items in a single gRPC call (batch operation)
        /// Called by: Basket.API when checking out (multiple items)
        /// This is more efficient than calling GetStock multiple times
        /// </summary>
        public override async Task<StocksResponse> GetStocks(StocksRequest request, ServerCallContext context)
        {
            _logger.LogInformation("gRPC GetStocks called for {Count} items", request.ItemNos.Count);

            try
            {
                var stocks = await _inventoryService.GetStockByItemsAsync(request.ItemNos);

                var response = new StocksResponse();
                foreach (var stock in stocks)
                {
                    response.Stocks.Add(new StockModel
                    {
                        ItemNo = stock.ItemNo,
                        Quantity = stock.Quantity,
                        IsAvailable = stock.Quantity > 0
                    });
                }

                _logger.LogDebug("Returned stock for {Count} items", response.Stocks.Count);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting stocks for items");
                throw new RpcException(new Status(StatusCode.Internal, ex.Message));
            }
        }
    }
}
