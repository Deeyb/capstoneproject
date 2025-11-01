# Algorithm and Pseudocode

## Algorithm

An **algorithm** is a step-by-step plan to solve a problem. It's like a recipe that tells you exactly what to do, one step at a time.

### When is Algorithm Used?

- During the **Design Phase** (Phase 3) of Program Development Life Cycle
- Before writing code, we first create an algorithm

### What Makes a Good Algorithm?

1. **Clear inputs and outputs** - Know what goes in and what comes out
2. **Each step is clear** - No confusion about what to do
3. **Effective** - Solves the problem in the best way
4. **No code** - Written in plain language, not programming code

---

## Algorithm Example

### Problem: Find the Average Grade of 10 Students

**Algorithm:**
1. Identify the grades of the 10 students
2. Add all the grades together
3. Divide the total by 10
4. Round off to two decimal places
5. Show the result

### Try-It: Average Grade Calculator (C++)

```cpp
#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int sum = 0;
    int grade;
    
    // Read 10 grades
    for (int i = 1; i <= 10; i++) {
        cout << "Enter grade " << i << ": ";
        cin >> grade;
        sum += grade;
    }
    
    // Calculate and display average
    double average = sum / 10.0;
    cout << fixed << setprecision(2);
    cout << "Average grade: " << average << endl;
    
    return 0;
}
```

---

## Pseudocode

**Pseudocode** is a way to write algorithms using English-like statements. It's like writing in plain English, but following a simple structure.

### What is Pseudocode?

- **English-like statements** - Written in simple, readable language
- **Describes algorithm steps** - Shows how to solve the problem
- **Not a programming language** - It's just plain text, not actual code

### Why Use Pseudocode?

- Easy to read and understand
- Helps plan the solution before coding
- Can be converted to any programming language

---

## Pseudocode Example 1: Average Grade Calculation

### Problem: Find Average of 10 Grades

**Pseudocode:**
```
Initialize sum to 0
Repeat for N = 1 to 10
    Read grade
    Calculate sum = sum + grade
End Loop
Calculate average = sum / 10
Print average
```

### Try-It: Average Grade Calculator (C++)

```cpp
#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int sum = 0;
    int grade;
    
    // Read 10 grades
    for (int i = 1; i <= 10; i++) {
        cout << "Enter grade " << i << ": ";
        cin >> grade;
        sum += grade;
    }
    
    // Calculate and display average
    double average = sum / 10.0;
    cout << fixed << setprecision(2);
    cout << "Average grade: " << average << endl;
    
    return 0;
}
```

---

## Pseudocode Example 2: Count Characters in a Word

### Problem: Count how many characters are in a word

**Input:** A word (like "hello")
**Output:** Number of characters (like 5)

**Pseudocode:**
```
Initialize Count to 0
REPEAT:
    Read one character at a time
    If a character is found, add 1 to Count
UNTIL there are no more characters
```

### Try-It: Character Counter (C++)

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string word;
    int count = 0;
    
    cout << "Enter a word: ";
    cin >> word;
    
    // Count characters
    for (int i = 0; i < word.length(); i++) {
        count++;
    }
    
    cout << "The word has " << count << " characters." << endl;
    
    return 0;
}
```

---

## Key Points to Remember

- **Algorithm** = Step-by-step plan to solve a problem
- **Pseudocode** = Writing algorithms in simple English-like statements
- Both are used during the **Design Phase** (Phase 3) of PDLC
- **Top-Down design** - Start with big steps, break them into smaller steps
- Algorithms should be clear, easy to understand, and effective
- No programming code in algorithms - just plain language

