# node-rabbitmq
A simple containerised Producer Consumer system utilising RabbitMQ, NodeJs, Docker and CloudAMQP.

To deploy with Docker:
    
    # build rabbitmq image and run rabbitmq container
    cd /sv/rabbitmq
    sudo docker build -t rabbitmq .
    sudo docker run --hostname my-rabbit --name rabbitmq -p 8080:15672 -p 5672:5672 -d --restart always rabbitmq

    # build node image and run node-consumer container
    cd /sv/node-consumer
    sudo docker build -t node-consumer .
    sudo docker run --name node-consumer -p 4000:4000 -d --restart always -v /sv/node-consumer/lib:/app/lib node-consumer

    # build node image and run node-producer container
    cd /sv/node-producer
    sudo docker build -t node-producer .
    sudo docker run --name node-producer -p 80:80 -d --restart always -v /sv/node-producer/lib:/app/lib node-producer
