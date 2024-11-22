---
author: Sathya Narayana Bhat
pubDatetime: 2024-11-04T15:00:00Z
modDatetime: 2024-11-11T15:23:43Z
title: Wazuh AWS Integration
slug: Wazuh-AWS-Integration
featured: false
draft: true
tags:
  - Wazuh
  - AWS
  - Log-ingestion
description:
  A easier way to import auditd logs into wazuh via laurel.
---

## Basic Steps involved:

1. Create a S3 bucket

2. Configure a Cloud trail to dump logs into the created S3 bucket

3. Configure a user in a user group[for better organization].

4. Create a policy and attach it to the created user-group to access the s3 bucket.

5. Configure a role to access bucket

6. Configure user to assume role to access bucket

7. Installing Boto3 in wazuh to use aws sdk.

8. Configure wazuh to use the user and role created to read the s3 bucket.

## Steps in Detail:

### Creating a S3 bucket

Just create a bucket with default permissions no requirements additional here

### Configure a Cloud trail to dump logs into the created S3 bucket

1. Create a new Cloud trail by going to the following page: Management & Governance > CloudTrail and clicking create a new trail.

2. Specify the trail name, and choose existing s3 bucket for storage location.

 

3. Choose relevant logs that needs to be logged into wauzh, which is divided into Management, Data and Insights events.

4. Specify the filters for relavent events.

 

5. Review and Create the trail



### Configure a user and usergroup to access the s3 bucket

1. Create a AWS User-group in the IAM

2. Create a User attached to the User Group Created

3. Then go to Security credentials, scroll down to Access keys, and click Create access key. 

4. Select and confirm the Command Line Interface (CLI) use case and click Next 

 

5. Create the key, save that key and id as it will be required in upcoming set

 

6. Create a policy and attach it to the created user-group

7. Click Policies > Create policy

8. Switch to JSON Editor

9. Add the required resources and Action in it, sample given below: 

```json
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GetS3Logs",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::<WAZUH_AWS_BUCKET>/*",
                "arn:aws:s3:::<WAZUH_AWS_BUCKET>"
            ]
        }
    ]
}
```
10. Confirm and create the policy.

11. Go the User group created

12. Navigate to Permissions , click on Add permissions, then Attach policies.

13. Search the policy created and attach it to the group.

14. Review and confirm it.

### Configure a role for user to assume

16. Go to Roles on the left side of the AWS console in IAM and click Create role.

17. Choose AWS service as Trusted entity type, S3 as service and Use case then click Next.

Choose the previously created policy as permission.

Add the Created User’s ARN number as the following format: 'AWS':'<ARN>' under Principal in Trust Policy

Review and create the role.

Go to the Policy Created and edit the Permissions as follows:

Add the sys:AssumeRolepermission under Actions 

Add the ARN of the Created Role under Resource

Copy and store the ARN of the create Role.

Installing Boto3 in wazuh to use aws sdk.

Install python3 and pip3 if they are not present

pip3 install --upgrade pip

Run a. in case the python version is <3.10, b. in case of python version >3.11 

pip3 install boto3==1.34.135 pyarrow==14.0.1 numpy==1.26.0

pip3 install --break-system-packages boto3==1.34.135 pyarrow==14.0.1 numpy==1.26.0

Configure wazuh to use the user and role created to read the s3 bucket.

Create a file in the root home directory /root/.aws/credentials with the Values of the user created in the following format: 
```conf
[default]
aws_access_key_id=<Access Key ID>
aws_secret_access_key=<Secret Access Key>
region=us-east-1
```
Add the following into ossec.conf:
```xml
<ossec_config>  
  <bucket type="cloudtrail">
    <name><WAZUH_AWS_BUCKET></name>
    <aws_profile>default</aws_profile>
    <iam_role_arn><ARN of Role Created></iam_role_arn>
  </bucket>
</ossec_config>
```
Restart the wazuh manager service using systemctl restart wazuh-manager

Demo

