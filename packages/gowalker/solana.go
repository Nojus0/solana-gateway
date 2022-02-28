package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

func getSlot(url string) (uint64, error) {
	var body = []byte(`{"jsonrpc": "2.0","id": 1,"method": "getSlot","params": [{"commitment": "finalized"}]}`)

	var res, err = http.Post(url, "application/json", bytes.NewBuffer(body))
	defer res.Body.Close()

	if err != nil {
		return 0, errors.New("REQ_ERROR")
	}

	var bytes, _ = io.ReadAll(res.Body)

	var response SlotResponse

	if dError := json.Unmarshal(bytes, &response); dError != nil {
		panic("Decode error: " + dError.Error())
	}

	return response.Result, nil
}

func getBlock(url string, block uint64) (BlockResponse, error) {
	var body = []byte(fmt.Sprintf(`{"jsonrpc": "2.0","id":1,"method":"getBlock","params":[%d, {"encoding": "jsonParsed","transactionDetails":"full","rewards":false}]}`, block))

	var res, err = http.Post(url, "application/json", bytes.NewBuffer(body))
	defer res.Body.Close()

	if err != nil {
		return BlockResponse{}, errors.New("REQ_ERROR")
	}

	var bytes, _ = io.ReadAll(res.Body)

	var parsed BlockResponse

	fmt.Println(block)
	if de := json.Unmarshal(bytes, &parsed); de != nil {
		panic("Decode error: " + de.Error())
	}

	return parsed, nil
}

func getBlocks(url string, start uint64, end uint64) (BlocksResponse, error) {
	var body = []byte(fmt.Sprintf(`{"jsonrpc": "2.0","id":1,"method":"getBlocks","params":[%d,%d]}`, start, end))

	res, err := http.Post(url, "application/json", bytes.NewBuffer(body))

	if err != nil {
		return BlocksResponse{}, errors.New("REQ_ERROR")
	}

	defer res.Body.Close()

	var bytes, _ = io.ReadAll(res.Body)

	var parsed BlocksResponse

	if err := json.Unmarshal(bytes, &parsed); err != nil {
		return BlocksResponse{}, errors.New("DECODE_ERROR")
	}

	return parsed, nil
}
func (b *Parsed) UnmarshalJSON(data []byte) error {

	var v UnmarshalParsed

	if err := json.Unmarshal(data, &v); err != nil {
		return nil
	}

	*b = Parsed(v)

	return nil
}
