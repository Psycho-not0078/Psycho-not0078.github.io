---
author: Sathya Narayana Bhat
pubDatetime: 2024-11-04T15:00:00Z
modDatetime: 2024-11-22T08:16:10Z
title: Wazuh AWS Integration
slug: Wazuh-AWS-Integration
featured: false
draft: false
tags:
  - Wazuh
  - AWS
  - Log-ingestion
description:
  A easier way to import auditd logs into wazuh via laurel.
---

## Basic Steps involved

1. Create a S3 bucket

2. Configure a Cloud trail to dump logs into the created S3 bucket

3. Configure a user in a user group[for better organization].

4. Create a policy and attach it to the created user-group to access the s3 bucket.

5. Configure a role to access bucket

6. Configure user to assume role to access bucket

7. Installing Boto3 in wazuh to use aws sdk.

8. Configure wazuh to use the user and role created to read the s3 bucket.

## Steps in Detail

### Creating a S3 bucket

- Just create a bucket with default permissions no requirements additional here

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

### Create a policy and attach it to the created user-group

1. Click Policies > Create policy

2. Switch to JSON Editor

3. Add the required resources and Action in it, sample given below:

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

4. Confirm and create the policy.

5. Go the User group created

6. Navigate to Permissions , click on Add permissions, then Attach policies.

7. Search the policy created and attach it to the group.

8. Review and confirm it.

### Configure a role for user to assume

1. Go to Roles on the left side of the AWS console in IAM and click Create role.

2. Choose AWS service as Trusted entity type, S3 as service and Use case then click Next.

3. Choose the previously created policy as permission.

4. Add the Created User’s ARN number as the following format: 'AWS':'<ARN>' under Principal in Trust Policy

5. Review and create the role.

6. Go to the Policy Created and edit the Permissions as follows:

7. Add the sys:AssumeRolepermission under Actions

8. Add the ARN of the Created Role under Resource

9. Copy and store the ARN of the create Role.

### Installing Boto3 in wazuh to use aws sdk

1. Install python3 and pip3 if they are not present

2. ```pip3 install --upgrade pip```

3. Run a. in case the python version is `<3.10`, b. in case of python version `>3.11`

    a. ```pip3 install boto3==1.34.135 pyarrow==14.0.1 numpy==1.26.0```

    b. ```pip3 install --break-system-packages boto3==1.34.135 pyarrow==14.0.1 numpy==1.26.0```

### Configure wazuh to use the user and role created to read the s3 bucket

1. Create a file in the root home directory /root/.aws/credentials with the Values of the user created in the following format:

    ```conf
    [default]
    aws_access_key_id=<Access Key ID>
    aws_secret_access_key=<Secret Access Key>
    region=us-east-1
    ```

2. Add the following into ossec.conf:

    ```xml
    <ossec_config>  
    <bucket type="cloudtrail">
        <name><WAZUH_AWS_BUCKET></name>
        <aws_profile>default</aws_profile>
        <iam_role_arn><ARN of Role Created></iam_role_arn>
    </bucket>
    </ossec_config>
    ```

3. Restart the wazuh manager service using systemctl restart wazuh-manager

## Demo
