import { CartItem, CartProduct } from "@src/models/cartProduct";
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
    accessKeyId: process.env.TABLE_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.TABLE_SECRET_ACCESS_KEY!!,
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
  if (!response.Items) {
    return [];
  }
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
      return;
    } catch (error) {
      attempts++;
      console.log(`Failed to remove item from cart. Attempt ${attempts}`);
      console.log(error);
    }
  }
};

const clearCart = async (id: string) => {
  const cartItems = await getCart(id);
  if (cartItems.length === 0) {
    return;
  }
  const productIds = cartItems.map((item) => item.productId);
  productIds.map(async (productId) => {
    const command = new DeleteItemCommand({
      TableName: SHOPPING_CART_TABLE_NAME,
      Key: marshall({ id, productId }),
    });
    await client.send(command);
  });
  await Promise.all(productIds);
  return;
};

export const ShoppingCartService = {
  getCart,
  addItem,
  removeItem,
  clearCart,
};
