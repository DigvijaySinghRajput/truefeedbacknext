import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User";

class TrieNode {
  data: string = "/0";
  isTerminal: boolean = false;
  children: { [key: string]: TrieNode } = {};

  constructor(char: string) {
    this.data = char;
  }

  makeTerminal() {
    this.isTerminal = true;
  }
}

class Trie {
  root: TrieNode;
  constructor() {
    this.root = new TrieNode("");
  }

  userinsert(word: string) {
    let curr: TrieNode = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (curr.children[char]) {
        curr = curr.children[char];
      } else {
        let child: TrieNode = new TrieNode(char);
        curr.children[char] = child;
        curr = child;
      }
    }
    curr.makeTerminal();
  }

  usersearch(word: string): string {
    let curr: TrieNode = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (curr.children[char]) {
        curr = curr.children[char];
      } else {
        return "No User found";
      }
    }
    return curr.isTerminal ? word : "No User found";
  }

  collectword(prefix: string, curr: TrieNode, result: string[]) {
    if (curr.isTerminal) result.push(prefix);
    for (let char in curr.children) {
      let suggestion: TrieNode = curr.children[char];
      this.collectword(prefix + char, suggestion, result);
    }
  }

  userwithprefix(prefix: string): string[] {
    let result: string[] = [];
    let curr: TrieNode = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (curr.children[char]) {
        curr = curr.children[char];
      } else {
        return result;
      }
    }
    this.collectword(prefix, curr, result);
    return result;
  }
}

let cachedTrie: Trie | null = null;
let cachedUserCount = 0;

export async function GET(request: Request) {
  await dbConnect();
  try {
    let currentUserCount = await UserModel.countDocuments();

    if (!cachedTrie || currentUserCount > cachedUserCount) {
      const username: string[] = (await UserModel.find({}, "username")).map(
        (user: any) => user.username
      );
      cachedTrie = new Trie();
      cachedUserCount = currentUserCount;
      username.forEach((name) => {
        cachedTrie?.userinsert(name);
      });
    }

    const { searchParams } = new URL(request.url);
    const searchuser = searchParams.get("searchuser") || "";
    const result = cachedTrie.userwithprefix(searchuser);

    return Response.json(
      {
        success: true,
        message: "Users fetched Successfully",
        users: result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Something went wrong while getting usernames");
    return Response.json({
      success: false,
      status: 500,
      message: "Something went wrong while getting usernames",
    });
  }
}
