'use strict';

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var SQS_QUEUE_URL = '';

exports.handler = (event, context, callback) => {

    SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
    console.log('SQS queue url: ', SQS_QUEUE_URL);

    if (!SQS_QUEUE_URL)
        throw 'No SQS Queue configured';


    var params = {
        MaxNumberOfMessages: 10,
        MessageAttributeNames: ["All"],
        QueueUrl: SQS_QUEUE_URL,
        VisibilityTimeout: 6,
        WaitTimeSeconds: 20
    };

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
            console.log("Receive Error", err);
            callback(err);
        } else {
            if (!_.isEmpty(data) && !_.isEmpty(data.Messages) && data.Messages.length > 0) {

                data.Messages.map(message => {
                    doSomethingWithMessage(message, function(err, resp) {

                        if (!err) {
                            console.log('Delete Message: ', message);

                            var deleteParams = {
                              QueueUrl: SQS_QUEUE_URL,
                              ReceiptHandle: message.ReceiptHandle
                            };

                            sqs.deleteMessage(deleteParams, function(err, message) {
                              if (err) console.log("Delete Error", err);
                              else console.log("Message Deleted", message);
                            });
                        }

                    });
                });              
            }
            callback(null, data);
        }
    });    

};

var doSomethingWithMessage = function(payload, callback) {

	// do something...
	if (!_.isEmpty(payload) && !_.isEmpty(payload.Body)) {
        var messageBody = JSON.parse(payload.Body);
		callback(null, payload);
	}
}
