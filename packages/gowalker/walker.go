package main

type Walker struct {
	isWalking bool
}

func (w *Walker) Walk(path string) ([]string, error) {
	return nil, nil
}

func New() *Walker {
	return &Walker{isWalking: false}
}
