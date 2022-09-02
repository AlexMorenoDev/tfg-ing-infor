# Use an official Python runtime as a parent image
FROM ubuntu:18.04

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install python3 and pip, needed for installing requirements.
RUN apt-get update && apt-get install -y python3 python3-pip

# Install any needed packages specified in requirements.txt
RUN pip3 install --trusted-host pypi.python.org -r requirements.txt

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Run app.py when the container launches
CMD ["python3", "waitress_server.py"]

