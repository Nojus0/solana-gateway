package main

import (
	"context"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Network struct {
	Pk        string
	Sk        string
	Fee       int
	CreatedAt uint64
	LastBlock uint64
	Url       string
	Name      string
}

func setLastBlock(dynamo *dynamodb.Client, network *Network, block uint64) error {

	_, err := dynamo.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String("payments"),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: network.Pk},
			"sk": &types.AttributeValueMemberS{Value: network.Sk},
		},
		UpdateExpression: aws.String("set lastBlock = :lastBlock"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":lastBlock": &types.AttributeValueMemberN{Value: strconv.FormatUint(block, 10)},
		},
	})

	if err != nil {
		return err
	}

	return nil
}
