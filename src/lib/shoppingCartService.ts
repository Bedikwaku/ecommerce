import { CartItem, CartProduct, ShoppingCart } from "@src/models/shoppingCart";
import { Product } from "@src/models/product";
import { ProductService } from "./productService";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { SHOPPING_CART_TABLE_NAME } from "./constants";
import {
  DynamoDBDocumentClient,
  QueryCommandInput,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const getCart = async (id: string): Promise<CartItem[]> => {
  const command: QueryCommandInput = {
    TableName: SHOPPING_CART_TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };
  const response = await docClient.send(new QueryCommand(command));
  console.log(response);
  if (!response.Items) {
    return [];
  }
  console.log(response.Items);
  return response.Items.map((item) => {
    return { productId: item.productId, quantity: item.quantity } as CartItem;
  });
};

const getCartItem = async (id: string, productId: string) => {
  const command = new GetItemCommand({
    TableName: SHOPPING_CART_TABLE_NAME,
    Key: marshall({ id, productId }),
  });
  const response = await client.send(command);
  console.log(response);
  if (!response.Item) {
    return null;
  }
  return unmarshall(response.Item) as CartProduct;
};

const addItem = async (id: string, productId: string, quantity: number) => {
  let attempts = 0;
  const MAX_RETRY = 5;
  const cartItem = await getCartItem(id, productId);
  if (cartItem) {
    quantity += cartItem.quantity;
  }
  const command = new PutItemCommand({
    TableName: SHOPPING_CART_TABLE_NAME,
    Item: marshall({ id, productId, quantity }),
  });
  while (attempts < MAX_RETRY) {
    try {
      const res = await client.send(command);
      console.log(res);
      return;
    } catch (error) {
      attempts++;
      console.log(`Failed to add item to cart. Attempt ${attempts}`);
      console.log(error);
    }
    console.error("Failed to add item to cart");
  }
};

const removeItem = async (id: string, productId: string, quantity: number) => {
  let attempts = 0;
  const MAX_RETRY = 5;
  const cartItem = await getCartItem(id, productId);
  if (!cartItem) {
    return;
  }
  quantity = cartItem.quantity - quantity;
  let command: PutItemCommand | DeleteItemCommand;
  if (quantity <= 0) {
    // Delete item from database
    command = new DeleteItemCommand({
      TableName: SHOPPING_CART_TABLE_NAME,
      Key: marshall({ id, productId }),
    });
  } else {
    command = new PutItemCommand({
      TableName: SHOPPING_CART_TABLE_NAME,
      Item: marshall({ id, productId, quantity }),
    });
  }
  while (attempts < MAX_RETRY) {
    try {
      let res;
      if (command instanceof DeleteItemCommand) {
        res = await client.send(command);
      } else if (command instanceof PutItemCommand) {
        res = await client.send(command);
      }
      console.log(res);
      return;
    } catch (error) {
      attempts++;
      console.log(`Failed to remove item from cart. Attempt ${attempts}`);
      console.log(error);
    }
  }
};

const checkout = async (cart: CartProduct[]): Promise<void> => {
  // Validate stock availability for each item in the cart
  for (const item of cart) {
    const product = await ProductService.getProduct(item.product.id);
    if (!product.isAvailable(item.quantity)) {
      throw new Error(
        `Product ${product.name} is not available in the desired quantity`
      );
    }
  }

  // Here, you would typically proceed with creating an order record in the database
  // and deducting the quantities from the inventory, but those steps are omitted for brevity

  console.log("Checkout successful");
};

export const ShoppingCartService = {
  getCart,
  addItem,
  removeItem,
  checkout,
};
