import { sleep, uuidv4 } from "@src/lib/utils";
import {
  PutItemCommand,
  DynamoDBClient,
  GetItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand, // Add this line
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Product } from "@src/models/product";
import { PRODUCT_TABLE_NAME } from "./constants";
import "server-only";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.TABLE_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.TABLE_SECRET_ACCESS_KEY!!,
  },
});

const createProduct = async (
  name: string,
  description: string,
  price: number,
  inventory: number
) => {
  const MAX_RETRY = 5;
  let attempts = 0;
  const product: Product = {
    id: uuidv4("product_"),
    name,
    description,
    price,
    inventory,
  };
  while (attempts < MAX_RETRY) {
    try {
      const command = new PutItemCommand({
        TableName: PRODUCT_TABLE_NAME,
        Item: marshall(product),
        ConditionExpression: "attribute_not_exists(id)",
      });
      const response = await client.send(command);
      return product.id;
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        console.log(`ID collision, retrying after ${attempts ** 2} seconds...`);
        await sleep(1000 * attempts ** 2);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to generate unique ID");
};

interface UpdateProductProps {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  inventory?: number;
}
const updateProduct = async ({
  id,
  name,
  description,
  price,
  inventory,
}: UpdateProductProps) => {
  const updateExpression = [];
  console.log("Updating product", id);
  const expressionAttributeValues: { [key: string]: any } = {};
  const expressionAttributeNames: { [key: string]: any } = {};
  if (name) {
    updateExpression.push("#name = :name");
    expressionAttributeValues[":name"] = name;
    expressionAttributeNames["#name"] = "name";
  }
  if (description) {
    updateExpression.push("#description = :description");
    expressionAttributeValues[":description"] = description;
    expressionAttributeNames["#description"] = "description";
  }
  if (price) {
    updateExpression.push("#price = :price");
    expressionAttributeValues[":price"] = price;
    expressionAttributeNames["#price"] = "price";
  }
  if (inventory) {
    updateExpression.push("#inventory = :inventory");
    expressionAttributeValues[":inventory"] = inventory;
    expressionAttributeNames["#inventory"] = "inventory";
  }
  const commandExpression = "SET " + updateExpression.join(", ");
  console.log("Update expression:", commandExpression);
  const command = new UpdateItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: marshall({ id }),
    ExpressionAttributeNames: expressionAttributeNames,
    UpdateExpression: commandExpression,
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "UPDATED_NEW",
  });
  const response = await client.send(command);
  return id;
};

const deleteProduct = async (id: string) => {
  const command = new DeleteItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: marshall({ id }),
  });
  const response = await client.send(command);
  return id;
};

const getProduct = async (id: string) => {
  const command = new GetItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: marshall({ id }),
  });
  const response = await client.send(command);
  if (!response.Item) {
    throw new Error("Product not found");
  }
  return unmarshall(response.Item);
};

const getProducts = async (query?: string): Promise<Product[]> => {
  console.log("Getting products");
  const command = query
    ? new ScanCommand({
        TableName: PRODUCT_TABLE_NAME,
        ExpressionAttributeNames: {
          "#name": "name",
          "#description": "description",
        },
        ExpressionAttributeValues: {
          ":query": { S: query },
        },
        FilterExpression:
          "contains(#name, :query) or contains(#description, :query)",
      })
    : new ScanCommand({ TableName: PRODUCT_TABLE_NAME });

  const response = await client.send(command);
  while (response.LastEvaluatedKey) {
    console.log("Paginating...");
    const nextCommand = new ScanCommand({
      TableName: PRODUCT_TABLE_NAME,
      ExclusiveStartKey: response.LastEvaluatedKey,
    });
    const nextResponse = await client.send(nextCommand);
    response.Items?.push(...nextResponse.Items!);
    response.LastEvaluatedKey = nextResponse.LastEvaluatedKey;
  }
  if (response.Items) {
    return response.Items.map((item) => unmarshall(item) as Product);
  }
  return [];
};

const isAvailable = async (id: string, quantity: number) => {
  const product = await getProduct(id);
  return product.inventory >= quantity;
};

const searchProducts = async (query: string): Promise<Product[]> => {
  // This can be improved using fuzzy search
  const params = {
    TableName: PRODUCT_TABLE_NAME,
    FilterExpression:
      "contains(#name, :query) or contains(#description, :query)",
    ExpressionAttributeNames: {
      "#name": "name",
      "#description": "description",
    },
    ExpressionAttributeValues: {
      ":query": { S: query },
    },
  };

  const command = new ScanCommand(params);

  try {
    const response = await client.send(command);
    if (response.Items) {
      return response.Items.map((item) => unmarshall(item) as Product);
    }
    return [];
  } catch (error) {
    console.error("Error scanning products:", error);
    throw new Error("Failed to search products");
  }
};

export const ProductService = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  isAvailable,
  searchProducts,
};
