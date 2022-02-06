package main

// var slot uint64 = 112899369

// 	fmt.Println(slot)

// 	var block, _ = getBlock(slot)

// 	for _, txn := range block.Result.Transactions {
// 		for _, pInstr := range txn.Transaction.Message.Instructions {
// 			if pInstr.Parsed.Type == "transfer" {
// 				fmt.Println(`
// SOL Source: ` + pInstr.Parsed.Info.Source + `
// SOL Destination: ` + pInstr.Parsed.Info.Destination + `
// SOL Amount: ` + strconv.FormatUint(uint64(pInstr.Parsed.Info.Lamports), 10) + `
// SIG ` + strings.Join(strings.Split(txn.Transaction.Signatures[0], " "), "") + `
// `)
// 			}
// 		}
// 	}

// 	for _, txn := range block.Result.Transactions {
// 		for _, i := range txn.Meta.InnerInstructions {
// 			for _, inner := range i.Instructions {
// 				if inner.Parsed.Type == "transfer" && inner.Program == "spl-token" {
// 					fmt.Println(`
// SPL Source: ` + inner.Parsed.Info.Source + `
// SPL Destination: ` + inner.Parsed.Info.Destination + `
// SPL Amount: ` + inner.Parsed.Info.Amount + `
// SIG ` + strings.Join(strings.Split(txn.Transaction.Signatures[0], " "), "") + `
// `)
// 				}
// 			}

// 		}
// 	}
