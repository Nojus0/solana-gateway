package main

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type Walker struct {
	isWalking bool
	network   *Network
	interval  time.Duration
	dynamo    *dynamodb.Client
}

func (w *Walker) Transfer(t Instruction, sig string) {
	println(`
	------------------------ SOL ---------------------------
	FROM ` + t.Parsed.Info.Source + `
	TO   ` + t.Parsed.Info.Destination + `
	SOL ` + strconv.FormatUint(t.Parsed.Info.Lamports, 10) + `
	SIG  ` + sig + `
	------------------------ SOL ---------------------------
	`)
}
func (w *Walker) TransferSpl(t SplInstruction, sig string) {
	println(`
	------------------------ SPL ---------------------------
	FROM ` + t.Parsed.Info.Source + `
	TO   ` + t.Parsed.Info.Destination + `
	AMOUNT ` + t.Parsed.Info.Amount + `
	SIG  ` + sig + `
	------------------------ SPL ---------------------------
	`)
}

func (w *Walker) Walk() {

	for w.isWalking {

		var latestSlot, err = getSlot(w.network.Url)

		if err != nil {
			log.Printf("Error getting slot: " + err.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			time.Sleep(w.interval)
			continue
		}

		if w.network.LastBlock == 0 {
			w.network.LastBlock = latestSlot
		}

		var blocksResp = BlocksResponse{Result: []uint64{112928254, 112928255}}

		// var blocksResp, _ = getBlocks(w.network.Url, w.network.LastBlock, latestSlot)

		// if erre != nil {
		// 	log.Printf("Error getting blocks: " + erre.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
		// 	time.Sleep(w.interval)
		// 	continue
		// }

		for _, block := range blocksResp.Result {
			fmt.Println(`QUEUE:` + strconv.FormatUint(block, 10))

			// ! GET BLOCK ERROR NOT HANDLED !
			blockInfo, _ := getBlock(w.network.Url, block)

			// if berr != nil {
			// 	log.Printf("Error getting block info: " + berr.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			// 	time.Sleep(w.interval)
			// 	continue
			// }

			// for _, t := range blockInfo.Result.Transactions {
			// 	for _, tt := range t.Transaction.Message.Instructions {
			// 		if tt.Program == "system" && tt.Parsed.Type == "transfer" {
			// 			w.Transfer(tt, t.Transaction.Signatures[0])
			// 		}
			// 	}
			// }

			for _, s := range blockInfo.Result.Transactions {
				for _, st := range s.Meta.InnerInstructions {

					for _, tfr := range st.Instructions {
						if tfr.Program == "spl-token" && tfr.Parsed.Type == "transfer" {
							w.TransferSpl(tfr, s.Transaction.Signatures[0])

						}
						if tfr.Program == "system" && tfr.Parsed.Type == "transfer" {
							w.TransferSpl(tfr, s.Transaction.Signatures[0])
						}

					}

				}
			}
		}

		// if setLastBlock(w.dynamo, w.network, latestSlot) != nil {
		// 	fmt.Printf("Error setting last block: " + err.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
		// 	time.Sleep(w.interval)
		// 	continue
		// }

		w.network.LastBlock = latestSlot
		fmt.Println("sleep")
		time.Sleep(w.interval)
	}

}

func (w *Walker) Start() *Walker {
	if w.isWalking {
		return w
	}

	w.isWalking = true
	w.Walk()
	return w
}

func (w *Walker) Stop() *Walker {
	w.isWalking = false
	return w
}

func NewWalker(dynamo *dynamodb.Client, network *Network, interval time.Duration) *Walker {
	return &Walker{isWalking: false, dynamo: dynamo, network: network, interval: interval}
}
