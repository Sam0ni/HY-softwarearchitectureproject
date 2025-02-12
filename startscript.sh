#!/bin/bash

PROJECTS=(
   "musicservice"
   "reviewservice"
   "userservice"
)

for PROJECT in "${PROJECTS[@]}"; do
  start bash -c "cd \"${PROJECT}\"; npm start; exec bash"
done

start bash -c "cd frontend/; npm run dev; exec bash"