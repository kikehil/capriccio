import paramiko
import sys

def run_ssh_commands(host, user, password, commands):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(host, username=user, password=password)
        
        for command in commands:
            print(f"Executing: {command}")
            stdin, stdout, stderr = client.exec_command(command)
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out:
                print(f"STDOUT:\n{out}")
            if err:
                print(f"STDERR:\n{err}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

host = "85.31.224.248"
user = "root"
password = "Netbios+2026"
path = "/var/www/html/capriccio/capriccio"

commands = [
    f"ls -la {path}",
    f"cd {path} && git status",
    f"cd {path} && ls -l database.sqlite",
    "pm2 list",
    "node -v",
    "npm -v"
]

run_ssh_commands(host, user, password, commands)
