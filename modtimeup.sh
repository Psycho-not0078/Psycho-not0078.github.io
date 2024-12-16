#!/bin/bash

# Get the current timestamp in the desired format
current_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if all three arguments are provided
if [ $# -ne 3 ]; then
  echo "Please provide three arguments: timestamp, filename, and action (update/create)"
  exit 1
fi

timestamp="$1"
filename="$2"
action="$3"

# Read the file contents into a variable
file_contents=$(cat "$filename")

# Update the appropriate timestamp based on the action
if [[ "$action" == "update" ]]; then
  updated_contents=$(sed "s/modDatetime: .*/modDatetime: $timestamp/" <<< "$file_contents")
elif [[ "$action" == "create" ]]; then
  updated_contents=$(sed "s/pubDatetime: .*/pubDatetime: $timestamp/" <<< "$file_contents")
else
  echo "Invalid action. Please specify 'update' or 'create'."
  exit 1
fi

# Write the updated content back to the file
echo "$updated_contents" > "$filename"