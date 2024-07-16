This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Pre-requisites

* AWS account

### Required Infrastructure Setup

1. To begin, you will need to setup up three dynamoDB tables:
  * `Products` - Partition key: `id` (string)
  * `Orders` - Partition key: `id` (string)
  * `ShoppingCarts` - Partition key: `id` (string), Sort key `productId` (string) 

2. Once these have been setup, navigate to the AWS Cognito console.

3. Create a new user pool (The steps laid out are summarized from [this blog](https://evoila.com/blog/secure-user-authentication-with-next-js-nextauth-js-and-aws-cognito-2/)) 
  1. Provider tyoes: Cognito user pool
  2. Cognito user pool sign-in options: Email
  3. Password policy mode: [default]
  4. MFA enforcement: No MFA
  5. User account recovery: [default]
  6. Configure sign-up experience: [default]
  7. Email provider: Send email with Cognito
  8. User pool name: Assessment
  9. Use the Cognito Hosted UI: True
  10. Domain type: Use a Cognito Dimain
  11. Cognito domain prefix: [any]
  12. App type: Public client
  13. App client name: [any]
  14. Client secret: Generate a client secret
  15. Allowed callback URLS: https://localhost:3000/api/auth/callback/cognito

4. Create an AWS IAM user

5. Attach the following policy to the IAM user
  ```
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "Statement1",
              "Effect": "Allow",
              "Action": [
                  "DynamoDB:*"
              ],
              "Resource": [
                  "arn:aws:dynamodb:${region}:${AWS_ACCOUNT_ID}:table/Products",
                  "arn:aws:dynamodb:${region}:{AWS_ACCOUNT_ID}:table/ShoppingCarts",
                  "arn:aws:dynamodb:${region}:{AWS_ACCOUNT_ID}:table/Orders"
              ]
          }
      ]
  }
  ```

6. Create an Access key for the user. The Access Key will be the `$TABLE_ACCESS_KEY_ID` and the Secret Key will be the `$TABLE_SECRET_ACCESS_KEY`

7. Create a .env.local file with the following configuration. `$NEXTAUTH_SECRET` can be anything
  ```
  COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID
  COGNITO_CLIENT_SECRET=$COGNITO_CLIENT_SECRET
  COGNITO_ISSUER=$COGNITO_ISSUER
  TABLE_ACCESS_KEY_ID=$TABLE_ACCESS_KEY_ID
  TABLE_SECRET_ACCESS_KEY=$TABLE_SECRET_ACCESS_KEY
  NEXTAUTH_SECRET=$NEXTAUTH_SECRET
  ```

8. Install the npm packages `npm install`

9. Run the development server `npm run dev`

10. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
