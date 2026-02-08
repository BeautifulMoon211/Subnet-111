# Automatic Subnet Registration Script

## 🎯 Purpose

This script automates the Bittensor subnet registration command, running it at regular intervals to ensure continuous registration on the network.

---

## 📋 Features

- ✅ **Automatic registration** - Runs registration command at configurable intervals
- ✅ **Configurable parameters** - Easy to customize wallet, hotkey, netuid, and interval
- ✅ **Color-coded output** - Clear visual feedback for each attempt
- ✅ **Error handling** - Reports success/failure of each registration
- ✅ **Graceful shutdown** - Handles Ctrl+C cleanly
- ✅ **Attempt counter** - Tracks number of registration attempts
- ✅ **Timestamps** - Shows when each attempt was made

---

## 🚀 Quick Start

### **Step 1: Make Script Executable**

```bash
chmod +x Subnet-111/scripts/auto-register.sh
```

### **Step 2: Run the Script**

```bash
./Subnet-111/scripts/auto-register.sh
```

### **Step 3: Enter Parameters**

The script will prompt you for:
- **Wallet Name** - Your Bittensor wallet name
- **Wallet Hotkey** - Your wallet hotkey
- **Subnet UID** - Subnet UID (default: 111)
- **Registration Interval** - Seconds between attempts (default: 5)

**Example:**
```
Please enter the following parameters:

Wallet Name: nick_cold
Wallet Hotkey: nick_hot
Subnet UID [default: 111]: 111
Registration Interval in seconds [default: 5]: 5

✓ Parameters received successfully!
```

### **Step 4: Monitor Registration**

The script will start running registration attempts automatically.

### **Step 5: Stop the Script**

Press `Ctrl+C` to stop the auto-registration loop.

---

## ⚙️ Input Parameters

When you run the script, you'll be prompted to enter:

### **1. Wallet Name**
- Your Bittensor wallet name
- **Required** - Cannot be empty
- Example: `nick_cold`

### **2. Wallet Hotkey**
- Your wallet hotkey name
- **Required** - Cannot be empty
- Example: `nick_hot`

### **3. Subnet UID**
- The subnet UID to register on
- **Optional** - Default: `111`
- Must be a number
- Example: `111`

### **4. Registration Interval**
- Seconds between registration attempts
- **Optional** - Default: `5`
- Must be a number
- Examples:
  - `5` - Register every 5 seconds
  - `10` - Register every 10 seconds
  - `30` - Register every 30 seconds
  - `60` - Register every 1 minute

### **Input Validation:**

The script validates all inputs:
- ✅ Wallet name and hotkey cannot be empty
- ✅ Subnet UID must be a number
- ✅ Interval must be a number
- ✅ Default values provided for optional fields

---

## 📊 Output Example

```
================================================================================
  Bittensor Subnet Auto-Registration
================================================================================

Please enter the following parameters:

Wallet Name: nick_cold
Wallet Hotkey: nick_hot
Subnet UID [default: 111]: 111
Registration Interval in seconds [default: 5]: 5

✓ Parameters received successfully!

Configuration:
  Wallet Name:  nick_cold
  Wallet Hotkey: nick_hot
  Subnet UID:   111
  Interval:     5 seconds

✓ btcli found: /usr/local/bin/btcli

Starting auto-registration loop...
Press Ctrl+C to stop

────────────────────────────────────────────────────────────────────────────────
Attempt #1 - 2026-02-08 10:30:15
────────────────────────────────────────────────────────────────────────────────
Running: btcli subnet register --no_prompt --wallet.name "nick_cold" --wallet.hotkey "nick_hot" --netuid "111"

[btcli output here...]

✓ Registration command completed successfully

Waiting 5 seconds before next attempt...

────────────────────────────────────────────────────────────────────────────────
Attempt #2 - 2026-02-08 10:30:20
────────────────────────────────────────────────────────────────────────────────
...
```

---

## 🎨 Color Coding

The script uses colors to make output easier to read:

- **🔵 BLUE** - Configuration and status messages
- **🟢 GREEN** - Success messages
- **🟡 YELLOW** - Warnings and command execution
- **🔴 RED** - Errors
- **🔷 CYAN** - Headers and separators

---

## 🛑 Stopping the Script

To stop the auto-registration loop:

1. Press `Ctrl+C` in the terminal
2. The script will display:
   ```
   Interrupted by user (Ctrl+C)
   Auto-registration stopped.
   ```
3. The script will exit cleanly

---

## 🔧 Troubleshooting

### **Problem: "btcli command not found"**

**Solution:**
1. Check if btcli is installed:
   ```bash
   which btcli
   ```

2. If not installed, install Bittensor:
   ```bash
   pip install bittensor
   ```

3. If installed but not in PATH, specify full path in script:
   ```bash
   BTCLI_CMD="/full/path/to/btcli"
   ```

---

### **Problem: "Permission denied"**

**Solution:**
Make the script executable:
```bash
chmod +x Subnet-111/scripts/auto-register.sh
```

---

### **Problem: Registration fails**

**Solution:**
1. Check wallet exists:
   ```bash
   btcli wallet list
   ```

2. Check wallet has funds for registration

3. Verify netuid is correct:
   ```bash
   btcli subnet list
   ```

4. Check network connectivity

---

## 📝 Manual Registration (One-Time)

If you want to run registration manually once:

```bash
btcli subnet register --no_prompt --wallet.name "nick_cold" --wallet.hotkey "nick_hot" --netuid "111"
```

---

## 🔄 Running in Background

To run the script in the background:

### **Using nohup:**
```bash
nohup ./Subnet-111/scripts/auto-register.sh > registration.log 2>&1 &
```

### **Using screen:**
```bash
screen -S auto-register
./Subnet-111/scripts/auto-register.sh
# Press Ctrl+A then D to detach
```

### **Using tmux:**
```bash
tmux new -s auto-register
./Subnet-111/scripts/auto-register.sh
# Press Ctrl+B then D to detach
```

To stop background process:
```bash
# Find process ID
ps aux | grep auto-register.sh

# Kill process
kill <PID>
```

---

## ⚠️ Important Notes

1. **Registration Costs**: Each registration may incur network fees. Monitor your wallet balance.

2. **Network Load**: Running registration too frequently may put unnecessary load on the network. Consider using a reasonable interval (5-10 seconds minimum).

3. **Wallet Security**: Ensure your wallet credentials are secure. The script uses the wallet name and hotkey, which should already be configured on your system.

4. **Continuous Operation**: This script runs indefinitely until stopped. Make sure to monitor it or run it in a managed environment.

---

## ✅ Checklist

Before running the script:

- [ ] btcli is installed and accessible
- [ ] Wallet is created and funded
- [ ] Wallet name and hotkey are correct
- [ ] Netuid is correct (111 for this subnet)
- [ ] Script is executable (`chmod +x`)
- [ ] Interval is set appropriately
- [ ] You understand registration costs

---

## 🎉 Summary

This script automates the subnet registration process with:
- ✅ Configurable parameters (wallet, hotkey, netuid, interval)
- ✅ Automatic retry every N seconds
- ✅ Color-coded visual feedback
- ✅ Error handling and reporting
- ✅ Graceful shutdown with Ctrl+C

**Result:** Continuous automated subnet registration! 🚀

