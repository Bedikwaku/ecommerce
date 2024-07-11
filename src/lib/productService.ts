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

const client = new DynamoDBClient({
  region: "af-south-1",
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
      console.log(response);
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

const updateProduct = async (
  id: string,
  name?: string,
  description?: string,
  price?: number,
  inventory?: number
) => {
  const updateExpression = [];
  const expressionAttributeValues: { [key: string]: any } = {};
  if (name) {
    updateExpression.push("set name = :name");
    expressionAttributeValues[":name"] = name;
  }
  if (description) {
    updateExpression.push("set description = :description");
    expressionAttributeValues[":description"] = description;
  }
  if (price) {
    updateExpression.push("set price = :price");
    expressionAttributeValues[":price"] = price;
  }
  if (inventory) {
    updateExpression.push("set inventory = :inventory");
    expressionAttributeValues[":inventory"] = inventory;
  }
  const command = new UpdateItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: marshall({ id }),
    UpdateExpression: updateExpression.join(", "),
    ExpressionAttributeValues: marshall(expressionAttributeValues),
    ReturnValues: "UPDATED_NEW",
  });
  const response = await client.send(command);
  console.log(response);
  return id;
};

const deleteProduct = async (id: string) => {
  const command = new DeleteItemCommand({
    TableName: PRODUCT_TABLE_NAME,
    Key: marshall({ id }),
  });
  const response = await client.send(command);
  console.log(response);
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
  console.log(response);
  return unmarshall(response.Item);
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
  isAvailable,
  searchProducts,
};
