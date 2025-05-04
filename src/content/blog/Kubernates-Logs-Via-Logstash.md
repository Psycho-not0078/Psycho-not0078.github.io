---
author: Sathya Narayana Bhat
pubDatetime: 2025-05-02T15:22:00Z
modDatetime: 2025-05-02T12:00:00Z
title: Wazuh log injestion from kubernates Deployment Via Logstash 
slug: Wazuh-log-injestion-from-kubernates-Deployment-Via-Logstash 
featured: true
draft: false
tags:
  - Wazuh
  - Logstash
  - filebeat
  - Log-ingestion
description:
  A simple guide on how to ingest application logs, deployed in kubernates, with the help of Logstash and filebeat.
---

Logs can be ingested from logstash via 2 methods: 

- Via wazuh agent
- Via syslog

### Via wazuh agent

Essentially the flow will be:

##### Log-source → Logstash → Temp file → Wazuh agent → Wazuh

#### Steps Summary:
1. Configure logstash to write to a specific file
2. Install wazuh agent in the logstash instance [in case of a VM]
3. Configure Wazuh agent to monitor a local log file.
4. Add rules in wazuh to parse the logstash logs.

> This method would require additional storage, hence monitoring the memory consumption is essential, to ensure that this doesn't fail, this can be done via auto purge of the created logfile.

> This method also introduces a single point of failure which is the created logfile

### Via syslog

Log flow will be as follows:

##### Log-source → Logstash → output_to_syslog plugin → Wazuh

#### Steps Summary:
1. Create a filebeat deployment with your application
2. Configure filebeat to push logs into logstash
3. Install output_to_syslog plugin in logstash via init pod
4. Configure logstash to push output into wauzh via output_to_syslog plugin
5. Configure Wazuh to Monitor specific port for syslog logs, configuration below
5. Add decoders and rules in wazuh to parse the logstash logs.

> syslog over ssl is possible, certificate must be loaded in the container, and configuration changes for the same are required. Reference: Syslog output plugin | Elastic Documentation
