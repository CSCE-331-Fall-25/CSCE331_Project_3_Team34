import random
import datetime
import csv

def main():
    print("Generating files...")
        
    # Constants
    MAX_SUM = 1_000_000
    
    MIN_ITEMS_PER_TRANSACTION = 1
    MAX_ITEMS_PER_TRANSACTION = 5
    
    START_DATE = datetime.date(2020, 1, 1)
    START_TIME = datetime.time(10, 0, 0)
    
    PEAK_DAYS = [(5, 15), (8, 20)] # (month, day)
    
    # Open files
    transactions = open("transactions.csv", "w")
    orders = open("orders.csv", "w")
    trays = open("trays.csv", "w")
    items = open("items.csv", "r")
    menu = open("menu.csv", "r")
    sizes = open("sizemods.csv", "r")
    employees = open("employees.csv", "r")

    # Use csv.reader to correctly parse fields containing commas
    item_lines = list(csv.reader(items))[1:]
    menu_lines = list(csv.reader(menu))[1:]
    size_lines = list(csv.reader(sizes))[1:]
    employee_lines = list(csv.reader(employees))[1:]
    
    # Create headers
    transactions.write("transactionid,employeeid,time,amount,profit,customerid,stage\n")
    orders.write("transactionid,itemid,orderid\n")
    trays.write("orderid,menuid,type,size\n")
    
    # Initialize variables
    cur_sum  = 0
    transaction_id = 1
    order_id = 1
    time = datetime.datetime.combine(START_DATE, START_TIME) + datetime.timedelta(minutes=random.randint(0, 60))
    
    # Generate transactions until reaching MAX_SUM
    while cur_sum < MAX_SUM:
        # Select a random employee
        emp_row = employee_lines[random.randint(0, len(employee_lines) - 1)]
        employee_id = int(emp_row[0])
        
        # Calculate transaction amount
        amount = 0
        num_items = random.randint(MIN_ITEMS_PER_TRANSACTION, MAX_ITEMS_PER_TRANSACTION)
        for _ in range(num_items):
            # Select a random item from items.csv (parsed by csv.reader)
            item_line = item_lines[random.randint(0, len(item_lines) - 1)]

            # Parse item details
            item_id = int(item_line[0])
            item_price = float(item_line[2])
            num_sides = int(item_line[3])
            num_entrees = int(item_line[4])
            item_type = item_line[6]

            # Add trays for entrees and sides if it's a meal
            if item_type == "meal":
                for _ in range(num_entrees):
                    # Obtain a random menu item of type entree
                    cur_lines = []
                    for line in menu_lines:
                        if "entree" in line[2]:
                            cur_lines.append(line)
                    menu_line = cur_lines[random.randint(0, len(cur_lines) - 1)]
                    menu_id = int(menu_line[0])
                    menu_price = float(menu_line[3])
                    
                    # Add entree to trays and orders
                    trays.write(f"{order_id},{menu_id},entree,\n")
                    
                    # Update amount
                    amount += menu_price
                
                for _ in range(num_sides):
                    # Obtain a random menu item of type side
                    cur_lines = []
                    for line in menu_lines:
                        if "side" in line[2]:
                            cur_lines.append(line)
                    menu_line = cur_lines[random.randint(0, len(cur_lines) - 1)]
                    menu_id = int(menu_line[0])
                    menu_price = float(menu_line[3])
                    
                    # Add side to trays and orders
                    trays.write(f"{order_id},{menu_id},side,\n")

                    # Update amount
                    amount += menu_price
            elif item_type == "a la carte":
                # Obtain a random menu item of the same type
                cur_lines = []
                for line in menu_lines:
                    if "entree" in line[2] or "side" in line[2]:
                        cur_lines.append(line)
                menu_line = cur_lines[random.randint(0, len(cur_lines) - 1)]
                menu_id = int(menu_line[0])
                menu_price = float(menu_line[3])
                menu_type = menu_line[2]
                
                size = ""
                # If entree, select a size
                if menu_type == "entree":
                    # Pick between small, medium, large as strings
                    size = random.choice(["small", "medium", "large"])
                else:
                    size = random.choice(["medium", "large"])
                
                if menu_price != 0:
                    menu_type = "premium"
                
                price_mod = 0
                for size_line in size_lines:
                    if size == size_line[2] and menu_type == size_line[4]:
                        price_mod = float(size_line[3])
                        break
                
                # Add item to trays and orders
                trays.write(f"{order_id},{menu_id},{item_type},{size}\n")

                # Update amount
                amount += menu_price + price_mod
            elif item_type == "drink":
                # Obtain a random menu item of the same type
                cur_lines = []
                for line in menu_lines:
                    if "drink" in line[2]:
                        cur_lines.append(line)
                menu_line = cur_lines[random.randint(0, len(cur_lines) - 1)]
                menu_id = int(menu_line[0])
                menu_price = float(menu_line[3])
                menu_type = menu_line[2]
                
                size = random.choice(["small", "medium", "large"])
                
                if menu_price != 0:
                    menu_type = "premium"
                
                price_mod = 0
                for size_line in size_lines:
                    if size == size_line[2] and menu_type == size_line[4]:
                        price_mod = float(size_line[3])
                        break
                
                # Add item to trays and orders
                trays.write(f"{order_id},{menu_id},{item_type},{size}\n")
                
                # Update amount
                amount += menu_price + price_mod
            # If no sides or entrees, add the item as is
            else:
                # Obtain a random menu item of the same type
                cur_lines = []
                for line in menu_lines:
                    if item_type in line[2]:
                        cur_lines.append(line)
                menu_line = cur_lines[random.randint(0, len(cur_lines) - 1)]
                menu_id = int(menu_line[0])
                menu_price = float(menu_line[3])
                
                # Add item to trays and orders
                trays.write(f"{order_id},{menu_id},{item_type},\n")
                
                # Update amount
                amount += menu_price
            
            # (orders entries are written immediately when trays are created)
            orders.write(f"{transaction_id},{item_id},{order_id}\n")
            order_id += 1
            
            # Update amount with item price
            amount += item_price
                    
        # Update transactions.csv
        transactions.write(f"{transaction_id},{employee_id},{time.strftime('%Y-%m-%d %H:%M:%S')},{round(amount, 2)},{round(amount * 0.2, 2)}\n")
            
        # Increment transaction ID and update current sum
        transaction_id += 1
        cur_sum += amount
        
        # Update time for next transaction
        if (time.month, time.day) in PEAK_DAYS:  # Peak Day
            random_increment = datetime.timedelta(minutes=random.randint(0, 15))
        elif time.weekday() == 5:  # Saturday
            random_increment = datetime.timedelta(minutes=random.randint(0, 30))
        else: # Weekday
            random_increment = datetime.timedelta(minutes=random.randint(0, 60))
        
        # If time exceeds 10 PM, move to next day at 10 AM
        if (time + random_increment).hour > 22:
            time = datetime.datetime.combine(time.date() + datetime.timedelta(days=1), datetime.time(10, 0, 0))
            # If day is Sunday, move to 11 AM
            if time.weekday() == 6:
                time = datetime.datetime.combine(time.date(), datetime.time(11, 0, 0))
        time += random_increment
                
    # Close files
    transactions.close()
    orders.close()
    trays.close()
    items.close()
    menu.close()
    sizes.close()
    employees.close()

    print("Files generated successfully.")
        

if __name__ == "__main__":
    main()