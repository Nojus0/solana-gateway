package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func main() {
	if os.Getenv("URL") == "" {
		log.Fatalf("Please set the URL environment variable")
	}

	var net = os.Getenv("NET")

	if net == "" {
		log.Fatalf("Please set the NET environment variable")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("eu-west-2"))
	if err != nil {
		log.Fatalf("Unable to load SDK config, %v", err)
	}

	dynamo := dynamodb.NewFromConfig(cfg)

	// get an item with partition key set to "foo" and sort key set to "bar"

	var resp, _ = dynamo.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("payments"),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: "NET#" + net},
			"sk": &types.AttributeValueMemberS{Value: "DETAILS"},
		},
	})

	network := Network{}

	if ur := attributevalue.UnmarshalMap(resp.Item, &network); ur != nil {
		log.Fatalf("Unable to unmarshal network, " + ur.Error())
	}

	fmt.Println(network.LastBlock)

	// NewWalker(dynamo).Start()

}
