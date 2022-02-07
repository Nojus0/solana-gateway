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

func (w *Walker) Transfer(t Instruction) {
	println(`
------------------------ SOL ---------------------------
FROM ` + t.Parsed.Info.Source + `
TO   ` + t.Parsed.Info.Destination + `
AMOUNT ` + strconv.FormatUint(t.Parsed.Info.Lamports, 10) + `
------------------------ SOL ---------------------------
`)
}

func (w *Walker) Walk() {

	for w.isWalking {

		var latestSlot, err = getSlot()

		if err != nil {
			log.Printf("Error getting slot: " + err.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			time.Sleep(w.interval)
			continue
		}

		if w.network.LastBlock == 0 {
			w.network.LastBlock = latestSlot
		}

		var blocksResp, erre = getBlocks(w.network.LastBlock, latestSlot)

		if erre != nil {
			log.Printf("Error getting blocks: " + erre.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			time.Sleep(w.interval)
			continue
		}

		for _, block := range blocksResp.Result {
			fmt.Println(`QUEUE:` + strconv.FormatUint(block, 10))

			// ! GET BLOCK ERROR NOT HANDLED !
			blockInfo, _ := getBlock(block)

			// if berr != nil {
			// 	log.Printf("Error getting block info: " + berr.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			// 	time.Sleep(w.interval)
			// 	continue
			// }

			for _, t := range blockInfo.Result.Transactions {
				for _, tt := range t.Transaction.Message.Instructions {
					if tt.Parsed.Type == "transfer" {
						w.Transfer(tt)
					}
				}
			}

			for _, s := range blockInfo.Result.Transactions {
				for _, st := range s.Meta.InnerInstructions {

					for _, tfr := range st.Instructions {

						if tfr.Program == "spl-token" && tfr.Parsed.Type == "transfer" {
							// w.Transfer(tfr)

							// ! spl !
						}

					}

				}
			}
		}

		if setLastBlock(w.dynamo, w.network, latestSlot) != nil {
			fmt.Printf("Error setting last block: " + err.Error() + " retrying in " + strconv.FormatInt(w.interval.Milliseconds(), 10) + "ms")
			time.Sleep(w.interval)
			continue
		}

		w.network.LastBlock = latestSlot

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
