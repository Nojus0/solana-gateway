package main

type BlockResponse struct {
	ID      int64  `json:"id"`
	Jsonrpc string `json:"jsonrpc"`
	Result  struct {
		BlockHeight       int64  `json:"blockHeight"`
		BlockTime         int64  `json:"blockTime"`
		Blockhash         string `json:"blockhash"`
		ParentSlot        int64  `json:"parentSlot"`
		PreviousBlockhash string `json:"previousBlockhash"`
		Transactions      []struct {
			Meta struct {
				Err struct {
					InstructionError []interface{} `json:"InstructionError"`
				} `json:"err"`
				Fee               int64 `json:"fee"`
				InnerInstructions []struct {
					Index        int64 `json:"index"`
					Instructions []struct {
						Accounts []string `json:"accounts"`
						Data     string   `json:"data"`
						Parsed   struct {
							Info struct {
								Amount      string `json:"amount"`
								Authority   string `json:"authority"`
								Destination string `json:"destination"`
								Source      string `json:"source"`
							} `json:"info"`
							Type string `json:"type"`
						} `json:"parsed"`
						Program   string `json:"program"`
						ProgramID string `json:"programId"`
					} `json:"instructions"`
				} `json:"innerInstructions"`
				LogMessages       []string `json:"logMessages"`
				PostBalances      []int64  `json:"postBalances"`
				PostTokenBalances []struct {
					AccountIndex  int64  `json:"accountIndex"`
					Mint          string `json:"mint"`
					Owner         string `json:"owner"`
					UITokenAmount struct {
						Amount         string  `json:"amount"`
						Decimals       int64   `json:"decimals"`
						UIAmount       float64 `json:"uiAmount"`
						UIAmountString string  `json:"uiAmountString"`
					} `json:"uiTokenAmount"`
				} `json:"postTokenBalances"`
				PreBalances      []int64 `json:"preBalances"`
				PreTokenBalances []struct {
					AccountIndex  int64  `json:"accountIndex"`
					Mint          string `json:"mint"`
					Owner         string `json:"owner"`
					UITokenAmount struct {
						Amount         string  `json:"amount"`
						Decimals       int64   `json:"decimals"`
						UIAmount       float64 `json:"uiAmount"`
						UIAmountString string  `json:"uiAmountString"`
					} `json:"uiTokenAmount"`
				} `json:"preTokenBalances"`
				Rewards []struct {
					Commission  interface{} `json:"commission"`
					Lamports    int64       `json:"lamports"`
					PostBalance int64       `json:"postBalance"`
					Pubkey      string      `json:"pubkey"`
					RewardType  string      `json:"rewardType"`
				} `json:"rewards"`
				Status struct {
					Err struct {
						InstructionError []interface{} `json:"InstructionError"`
					} `json:"Err"`
					Ok interface{} `json:"Ok"`
				} `json:"status"`
			} `json:"meta"`
			Transaction struct {
				Message struct {
					AccountKeys []struct {
						Pubkey   string `json:"pubkey"`
						Signer   bool   `json:"signer"`
						Writable bool   `json:"writable"`
					} `json:"accountKeys"`
					Instructions []struct {
						Accounts []string `json:"accounts"`
						Data     string   `json:"data"`
						Parsed   struct {
							Info struct {
								ClockSysvar      string `json:"clockSysvar"`
								Destination      string `json:"destination"`
								Lamports         int64  `json:"lamports"`
								SlotHashesSysvar string `json:"slotHashesSysvar"`
								Source           string `json:"source"`
								Vote             struct {
									Hash      string  `json:"hash"`
									Slots     []int64 `json:"slots"`
									Timestamp int64   `json:"timestamp"`
								} `json:"vote"`
								VoteAccount   string `json:"voteAccount"`
								VoteAuthority string `json:"voteAuthority"`
							} `json:"info"`
							Type string `json:"type"`
						} `json:"parsed"`
						Program   string `json:"program"`
						ProgramID string `json:"programId"`
					} `json:"instructions"`
					RecentBlockhash string `json:"recentBlockhash"`
				} `json:"message"`
				Signatures []string `json:"signatures"`
			} `json:"transaction"`
		} `json:"transactions"`
	} `json:"result"`
}

type SlotResponse struct {
	Jsonrpc string `json:"jsonrpc"`
	Result  uint64 `json:"result"`
	Id      uint   `json:"id"`
}
