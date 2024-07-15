import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Order } from "@src/models/order";
import { sleep, uuidv4 } from "./utils";
import { CartProduct } from "@src/models/cartProduct";
import { ORDER_TABLE_NAME } from "./constants";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.TABLE_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.TABLE_SECRET_ACCESS_KEY!!,
  },
});

interface CreateOrderProps {
  products: CartProduct[];
  user: string;
}

const createOrder = async ({ products, user }: CreateOrderProps) => {
  // Place order
  const MAX_RETRY = 5;
  const createdAt = new Date().toISOString();
  const total = products.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  let attempts = 0;
  while (attempts < MAX_RETRY) {
    const order: Order = {
      id: uuidv4("order_"),
      user,
      products,
      Total: total,
      createdAt,
    };
    const command = new PutItemCommand({
      TableName: ORDER_TABLE_NAME,
      Item: marshall(order),
      ConditionExpression: "attribute_not_exists(id)",
    });
    try {
      // Place order
      const response = await client.send(command);
      console.log(`Order placed: ${order.id}`);
      attempts++;
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        console.log(`ID collision, retrying after ${attempts ** 2} seconds...`);
        await sleep(1000 * attempts ** 2);
      } else {
        throw error;
      }
    }
  }
};

export const OrderService = {
  createOrder,
};
