package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func main() {
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

	var resp, getErr = dynamo.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String("payments"),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: "NET#" + net},
			"sk": &types.AttributeValueMemberS{Value: "DETAILS"},
		},
	})

	if getErr != nil {
		log.Fatalf("Can't find network " + net)
	}

	network := &Network{}

	if ur := attributevalue.UnmarshalMap(resp.Item, network); ur != nil {
		log.Fatalf("Unable to unmarshal network, " + ur.Error())
	}

	fmt.Println(network)

	NewWalker(dynamo, network, time.Millisecond*1000).Start()

}
