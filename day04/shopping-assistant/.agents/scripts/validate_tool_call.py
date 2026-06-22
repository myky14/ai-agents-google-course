import sys
import json
import re

def main():
    try:
        # Read from stdin
        input_data = sys.stdin.read()
        if not input_data.strip():
            # If no stdin is provided, default to allow
            print(json.dumps({"decision": "allow"}))
            sys.exit(0)

        data = json.loads(input_data)
    except Exception as e:
        # If parsing fails, report warning on stderr and allow
        print(f"Error parsing stdin: {e}", file=sys.stderr)
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)

    tool_call = data.get("toolCall", {})
    tool_name = tool_call.get("name")
    tool_args = tool_call.get("args", {})

    if tool_name == "run_command":
        command_line = tool_args.get("CommandLine", "")
        normalized_cmd = command_line.strip()

        # Regex to detect rm command with flags (r and/or f) targeting root (/), wildcard (*), or current dir (.)
        destructive_pattern = r"\brm\s+-[a-zA-Z]*(?:r|f)[a-zA-Z]*\s+(?:/|\*|\.)(?:\s|$)"

        # Regex to detect Windows equivalent destructive commands
        windows_destructive_pattern = r"\brd\s+/[sS]\s+/[qQ]\s+[cC]:\\(?:\s|$)"

        is_destructive = False
        reason = ""

        if re.search(destructive_pattern, normalized_cmd):
            is_destructive = True
            reason = f"Destructive command pattern detected: '{command_line}' targeting a critical directory or wildcard."
        elif re.search(windows_destructive_pattern, normalized_cmd, re.IGNORECASE):
            is_destructive = True
            reason = f"Destructive Windows command pattern detected: '{command_line}' targeting the C drive."

        if is_destructive:
            print(json.dumps({
                "decision": "deny",
                "reason": reason
            }))
            sys.exit(0)

    # Allow by default if no rules matched
    print(json.dumps({"decision": "allow"}))
    sys.exit(0)

if __name__ == "__main__":
    main()
