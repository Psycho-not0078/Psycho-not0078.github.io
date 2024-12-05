---
author: Sathya Narayana Bhat
pubDatetime: 2024-11-02T15:22:00Z
modDatetime: 2023-11-04T15:00:00Z
title: Wazuh log injestion from kubernates Deployment Via FluentD 
slug: Wazuh-log-injestion-from-kubernates-Deployment-Via-FluentD 
featured: true
draft: false
tags:
  - Wazuh
  - FluentD
  - Log-ingestion
description:
  A simple guide on how to ingest application logs, deployed in kubernates, with the help of fluentd and fluentbit.
---
Imagine if u have an application deployed in a kubernates cluster, you would want to have its log ingested into wazuh, To do it we install fluentd and fluentbit into the cluster and node respectively.

### Parts/components

| Component | Description | Usage |
|-----------|-------------|-------|
|Fluentbit|A lightweight, and highly scalable logging and metrics processor and forwarder|Setup in every node to extract logs from application nodes and store in central location for fluentd access|
|FluentD| an open-source data collector and log processor that unifies data collection and consumption|Deployed in seperate deployment set to transfer logs out of the cluster into wazuh (or any other log collector/viz)|

## Basic Steps:

- Create a fluentbit deployment (TBA)
- Create a custom docker image of fluentd daemonset with the following:

  - the fluentd plugin for syslog output GitHub - fluent-plugins-nursery/fluent-plugin-remote_syslog: Fluentd plugin for output to remote syslog serivce (e.g. Papertrail) , using the docker image of fluentd daemonset 

  - Custom fluentd configuration to include config required for the syslog output is added.

  - Upload the custom image to dockerhub[docker login will be required and the image should be public for ease of usage]/ Artifact Registry. 

  - Change the image used in the kubernates daemonset/statefulset to the custom image created.
  
## Steps in Detailed

- Create a custom docker image of fluentd which contains the output to syslog plugin:

  ```dockerfile
  FROM fluent/fluentd-kubernetes-daemonset:v1-debian-elasticsearch8
  RUN fluent-gem install fluent-plugin-remote_syslog
  COPY fluent.conf /fluentd/etc/
  ```

- Create a fluent.conf file in the same folder as the dockerfile:

  ```xml
    <match **>
      @type remote_syslog
      host "#{ENV['SERVER_IP']}"
      port 514
      protocol tcp
      severity debug    
      program fluentd
      hostname "#{ENV['HOST_NAME']}"
      <format>
        @type json
      </format>
    </match>
  ```

- Build, tag and push the image into dockerhub/Artifact Registry, by executing the following:

  ```bash
  docker build -t <image name> ./ 
  docker image tag <image name> <username>/<image name>:<tag>
  docker image push <username>/<image name>:<tag>
  ```

- Make changes to fluentd kubeconfig file as shown:

  ```yaml
  apiVersion: apps/v1
  kind: DaemonSet # can be statefulset too
  metadata:
    name: fluentd
    namespace: fluentd
    labels:
      k8s-app: fluentd-logging
      version: v1
      kubernetes.io/cluster-service: "true"
  spec:
    selector:
      matchLabels:
        k8s-app: fluentd-logging
        version: v1
    template:
      metadata:
        labels:
          k8s-app: fluentd-logging
          version: v1
      spec:
        serviceAccount: fluentd
        serviceAccountName: fluentd
        containers:
        - name: fluentd
          image: <username>/<image>:<tag>
          env:
            - name: SERVER_IP
              value: "SERVER_IP"
            - name: HOST_NAME
              value: "Fluent_D"
            - name: K8S_NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          volumeMounts:
          - name: varlog
            mountPath: /var/log
          - name: dockercontainerlogdirectory
            mountPath: /var/lib/docker/containers
            readOnly: true
          - name: dockercontainerlogdirectory
            mountPath: /var/log/pods
            readOnly: true
          securityContext:
            allowPrivilegeEscalation: false
            runAsUser: 0
        terminationGracePeriodSeconds: 30
        volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: dockercontainerlogdirectory
          hostPath:
            path: /var/log/pods
  ```

- Make the following Changes into wazuh's ossec.conf file, the change ensures that wazuh will monitor the syslog port [514] for traffic, which will be logged in archive.log and archive.json if log all is enabled.

  ```xml
  ...
  <remote>
    <connection>syslog</connection>
    <port>514</port>
    <protocol>tcp</protocol>
    <allowed-ips>0.0.0.0/0</allowed-ips>
    <local_ip>wazuh-ip</local_ip>
  </remote>
  ...
  ```

**_NOTE: ```/var/ossec/logs/ossec.logs``` usually contains the logs of all wauzh processes, but since the syslogs from fluentd isnt a wazuh process it will not be logged there. you will have to enable the log all option and view the archive.log/archive.json file to see if the logs are flowing in or not._**

- Before creating the decoder you need to get an idea of how does the log look like (as in how does wazuh get it as an input). For that go to ```/var/ossec/logs/archive.log```[after enabling log all in ossec.conf]. Sample log will look like:-

  ```json
  2024 Jul 18 11:52:01 Fluent_D->10.x.x.x Jul 18 06:22:01 Fluent_D fluentd: {"message":"[in_tail_kube_apiserver] /var/log/pods/kube-system_kube-apiserver-minikube_3c555f828409b009ebee39fdbedfcac0/kube-apiserver/0.log unreadable. It is excluded and would be examined next time."}
  ```
  
  in which wazuh will interpret it as follows:

  <span style="color:red">2024 Jul 18 11:52:01 Fluent_D->10.160.15.217</span> <span style="color:green">Jul 18 06:22:01 Fluent_D fluentd: {"message":"[in_tail_kube_apiserver] /var/log/pods/kube-system_kube-apiserver-minikube_3c555f828409b009ebee39fdbedfcac0/kube-apiserver/0.log unreadable. It is excluded and would be examined next time."}</span>

  The green part is the syslog and all regex, matches, etc should be made with the green text in mind and not including the red part. 

- Create decoder for the logs ingested

  ```xml
  <decoder name="fluent_sample">
    <program_name>^fluentd</program_name>
    <plugin_decoder>JSON_Decoder</plugin_decoder>
  </decoder>
  ```

- Create rules too for the same and then everyone is happy

  ![Alt text](https://media.tenor.com/La4qeHdSXx4AAAAM/family-guy-peter-griffin.gif "well damm, image didnt load")