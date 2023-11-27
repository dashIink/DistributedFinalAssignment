package main

import (
	"context"
	"fmt"
)

type TrieNode struct {
	key      rune
	children map[rune]*TrieNode
	value    []byte
}

func (tn *TrieNode) IsLeaf() bool {
	return len(tn.children) == 0
}

func (tn *TrieNode) GetValue() []byte {
	return tn.value
}

func (tn *TrieNode) SetValue(value []byte) {
	tn.value = value
}

type ChildNotFoundError struct{}

func (e ChildNotFoundError) Error() string {
	return "Child not found"
}

func (tn *TrieNode) GetChild(r rune) (*TrieNode, error) {
	if child, ok := tn.children[r]; ok {
		return child, nil
	} else {
		return nil, ChildNotFoundError{}
	}
}

func (tn *TrieNode) AddChild(r rune) *TrieNode {
	if chld, ok := tn.children[r]; ok {
		return chld
	}

	child := &TrieNode{
		key:      r,
		children: make(map[rune]*TrieNode),
	}
	tn.children[r] = child
	return child
}

func (tn *TrieNode) AddChilds(r string) *TrieNode {
	if len(r) == 0 {
		return tn
	}

	str := []rune(r)
	first := str[0]
	rest := str[1:]

	newTn := tn.AddChild(first)
	return newTn.AddChilds(string(rest))
}

type PrefixTree struct {
	root *TrieNode
}

func NewPrefixTree() *PrefixTree {
	return &PrefixTree{
		root: &TrieNode{
			children: make(map[rune]*TrieNode),
		},
	}
}

func (pt *PrefixTree) Get(ctx context.Context, key Key) (Value, error) {
	tn := pt.root
	for _, chr := range string(key) {
		if currTn, ok := tn.children[chr]; ok {
			tn = currTn
		} else {
			return nil, fmt.Errorf("key not found")
		}
	}
	return tn.GetValue(), nil
}

func (pt *PrefixTree) GetByPrefix(ctx context.Context, key Key) ([]Value, error) {
	tn := pt.root
	for _, chr := range string(key) {
		if currTn, ok := tn.children[chr]; ok {
			tn = currTn
		} else {
			return nil, fmt.Errorf("key not found")
		}
	}
	if tn.IsLeaf() {
		return nil, fmt.Errorf("No value(s) found")
	}
	values := make([]Value, 0)
	for r := range tn.children {
		values = append(values, tn.children[r].GetValue())
	}

	return values, nil
}

func (pt *PrefixTree) Put(ctx context.Context, key Key, value Value) error {
	tn := pt.root.AddChilds(string(key))
	tn.SetValue(value)
	return nil
}

func (pt *PrefixTree) Delete(ctx context.Context, key Key) error {
	tn := pt.root
	for _, chr := range string(key) {
		if currTn, ok := tn.children[chr]; ok {
			tn = currTn
		} else {
			return fmt.Errorf("key not found")
		}
	}
	tn.SetValue(nil)
	return nil
}

func (pt *PrefixTree) DeleteByPrefix(ctx context.Context, key Key) error {
	tn := pt.root
	for _, chr := range string(key) {
		if currTn, ok := tn.children[chr]; ok {
			tn = currTn
		} else {
			return fmt.Errorf("key not found")
		}
	}
	for r := range tn.children {
		delete(tn.children, r)
	}
	return nil
}
