# MyGuide Feedback Lambda

Lambda function for handling user feedback submission and retrieval.

## Endpoints

### POST /feedback
Submit user feedback after completing a tour.

**Request Body:**
```json
{
  "userName": "Jan de Vries",
  "userEmail": "jan@example.nl",
  "rating": 5,
  "review": "Geweldige tour!",
  "tourId": "tour-123",
  "tourCity": "Amsterdam",
  "tourDuration": "45 min",
  "tourStopCount": 5
}
```

**Behavior:**
- Rating < 3: Returns success but does NOT store in DynamoDB
- Rating >= 3: Stores in DynamoDB with status "approved"

### GET /feedback
Retrieve testimonials for the landing page.

**Query Parameters:**
- `limit`: Number of testimonials (default 10, max 50)

**Response:**
```json
{
  "testimonials": [...],
  "count": 10
}
```

## DynamoDB Table Setup

Create a DynamoDB table named `myguide-feedback` with:

### Table Structure
- **Partition Key (PK):** String - `FEEDBACK#<feedbackId>`
- **Sort Key (SK):** String - `METADATA`

### Global Secondary Index (GSI1)
- **Name:** `GSI1`
- **Partition Key (GSI1PK):** String - `FEEDBACK#APPROVED`
- **Sort Key (GSI1SK):** String - ISO timestamp for sorting

### AWS CLI Command
```bash
aws dynamodb create-table \
  --table-name myguide-feedback \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

## Deployment

1. Install dependencies:
   ```bash
   cd lambda/feedback
   npm install
   ```

2. Create deployment package:
   ```bash
   npm run zip
   ```

3. Deploy to AWS Lambda (or use your preferred deployment method)

4. Add route to API Gateway:
   - POST /feedback -> this Lambda
   - GET /feedback -> this Lambda

5. Set environment variable:
   - `DYNAMODB_TABLE`: myguide-feedback (optional, defaults to this value)

## IAM Permissions

The Lambda execution role needs:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/myguide-feedback",
        "arn:aws:dynamodb:*:*:table/myguide-feedback/index/GSI1"
      ]
    }
  ]
}
```
