package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

func getSlot() (uint64, error) {
	var body = []byte(`{"jsonrpc": "2.0","id": 1,"method": "getSlot","params": [{"commitment": "finalized"}]}`)

	var res, res_error = http.Post(os.Getenv("URL"), "application/json", bytes.NewBuffer(body))

	defer res.Body.Close()

	if res_error != nil {
		return 0, errors.New("REQ_ERROR")
	}

	var bytes, _ = io.ReadAll(res.Body)

	var response SlotResponse

	if dError := json.Unmarshal(bytes, &response); dError != nil {
		panic("Decode error: " + dError.Error())
	}

	return response.Result, nil
}

func getBlock(block uint64) (BlockResponse, error) {
	var body = []byte(fmt.Sprintf(`{"jsonrpc": "2.0","id":1,"method":"getBlock","params":[%d, {"encoding": "jsonParsed","transactionDetails":"full","rewards":false}]}`, block))

	var res, res_error = http.Post(os.Getenv("URL"), "application/json", bytes.NewBuffer(body))
	defer res.Body.Close()

	if res_error != nil {
		return BlockResponse{}, errors.New("REQ_ERROR")
	}

	var bytes, _ = io.ReadAll(res.Body)

	var parsed BlockResponse
	if dError := json.Unmarshal(bytes, &parsed); dError != nil {
		panic("Decode error: " + dError.Error())
	}

	return parsed, nil
}
