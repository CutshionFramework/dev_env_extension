import ast
import sys
import json

def parse_python_file(file_content):
    tree = ast.parse(file_content)
    classes = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            class_name = node.name
            classes[class_name] = {
                "functions": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
            }
    return classes

if __name__ == "__main__":
    file_content = sys.stdin.read()
    result = parse_python_file(file_content)
    print(json.dumps(result))