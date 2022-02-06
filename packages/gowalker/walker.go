package main

import "github.com/aws/aws-sdk-go-v2/service/dynamodb"

type Walker struct {
	isWalking bool
	dynamo    *dynamodb.Client
}

func (w *Walker) Walk(path string) {

}

func (w *Walker) Start() *Walker {
	w.isWalking = true
	return w
}

func (w *Walker) Stop() *Walker {
	w.isWalking = false
	return w
}

func NewWalker(dynamo *dynamodb.Client) *Walker {
	return &Walker{isWalking: false, dynamo: dynamo}
}
