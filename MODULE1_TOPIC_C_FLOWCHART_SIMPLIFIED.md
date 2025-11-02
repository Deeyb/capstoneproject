# Flowchart

A **flowchart** is a diagram that shows the steps of a process using shapes and arrows. It's like a visual recipe that shows how something works step-by-step.

## What is a Flowchart?

- A diagram showing the sequence of operations in a program
- Uses different shapes to represent different types of actions
- Shows how data flows through the program
- Helps programmers organize and share their ideas

Flowcharts are useful in many professions: programming, engineering, business, healthcare, and more!

---

## Guidelines for Creating Flowcharts

- **Only one Start and one Stop** - Every flowchart has one beginning and one ending
- **Connectors use numbers** - When you need to jump to another part on the same page
- **Connectors use letters** - When you need to jump to another page
- **Flow goes top to bottom** - Or left to right, like reading a book
- **Arrows don't cross** - Keep it neat and easy to follow

---

## Flowchart Symbols

Different shapes mean different things:

- **Start/Stop** - Oval shape (⭕) - Shows where the program begins and ends
- **Process** - Rectangle (▭) - Shows a calculation or action
- **Decision** - Diamond (⬦) - Shows a yes/no question or condition
- **Input/Output** - Parallelogram (▱) - Shows getting data or displaying results
- **Connector** - Circle (○) - Shows a jump to another part
- **Flow lines** - Arrows (→) - Shows the direction of flow

### Flowchart Symbols Diagram

![Flowchart Symbols](material_download.php?f=20251101_162722_e8bee52d_FLOWCHART_SYMBOLS_IMAGE.png)

---

## Real-World Flowchart Examples

### Example: Supply Request

![Supply Request Flowchart](material_download.php?f=SUPPLY_REQUEST_FLOWCHART.png)

### Example: Firmware Update

![Firmware Update Flowchart](material_download.php?f=FIRMWARE_UPDATE_FLOWCHART.png)

### Example: Crossing Traffic

![Crossing Traffic Flowchart](material_download.php?f=CROSSING_TRAFFIC_FLOWCHART.png)

### Example: Found Food in Fridge

![Found Food in Fridge Flowchart](material_download.php?f=FOUND_FOOD_FRIDGE_FLOWCHART.png)

---

# Flowcharts for Decision Making

Decision-making flowcharts use the **diamond shape** to ask questions. Based on the answer, the program follows different paths.

### How Decision Flowcharts Work:

1. **Test a condition** - Ask a question (like "Is it greater than 10?")
2. **If TRUE** - Follow the "Yes" path
3. **If FALSE** - Follow the "No" path

### Basic IF-ELSE Structure

![IF-ELSE Flowchart Structure](material_download.php?f=IF_ELSE_STRUCTURE_FLOWCHART.png)

### Nested IF-ELSE IF Structure

![Nested IF-ELSE IF Flowchart Structure](material_download.php?f=NESTED_IF_ELSE_FLOWCHART.png)

---

## Example 1: Pass or Fail

### Problem

Determine if a student passed or failed. Passing grade is 75.

### Algorithm

1. Input the prelim, midterm and final scores
2. Calculate average = (prelim + midterm + final) / 3
3. Check if average >= 75
4. If YES, print "Passed"
5. If NO, print "Failed"

### Pseudocode

```
Step 1: Input prelim, midterm and final grade
Step 2: Compute average = (prelim + midterm + final) / 3
Step 3: Is average >= 75?
    If YES: Print "Passed"
    If NO: Print "Failed"
```

### Flowchart

![Pass/Fail Flowchart](material_download.php?f=PASS_FAIL_FLOWCHART.png)

### Try-It: Pass/Fail Checker (C++)

```cpp
#include <iostream>
using namespace std;

int main() {
    double prelim, midterm, final, average;
    
    cout << "Enter prelim score: ";
    cin >> prelim;
    
    cout << "Enter midterm score: ";
    cin >> midterm;
    
    cout << "Enter final score: ";
    cin >> final;
    
    average = (prelim + midterm + final) / 3.0;
    
    if (average >= 75) {
        cout << "Passed" << endl;
    } else {
        cout << "Failed" << endl;
    }
    
    return 0;
}
```

---

## Example 2: Triangle Type

### Problem

Check if a triangle is equilateral, isosceles, or scalene.

- **Equilateral** - All three sides are equal
- **Isosceles** - Two sides are equal
- **Scalene** - No sides are equal

### Algorithm

1. Get the three sides of the triangle
2. If side1 == side2 AND side2 == side3 → Equilateral
3. If side1 == side2 OR side2 == side3 OR side3 == side1 → Isosceles
4. Otherwise → Scalene

### Flowchart

![Triangle Classification Flowchart](material_download.php?f=TRIANGLE_CLASSIFICATION_FLOWCHART.png)

### Try-It: Triangle Classifier (C++)

```cpp
#include <iostream>
using namespace std;

int main() {
    double side1, side2, side3;
    
    cout << "Enter side 1: ";
    cin >> side1;
    
    cout << "Enter side 2: ";
    cin >> side2;
    
    cout << "Enter side 3: ";
    cin >> side3;
    
    if (side1 == side2 && side2 == side3) {
        cout << "Equilateral triangle" << endl;
    } else if (side1 == side2 || side2 == side3 || side3 == side1) {
        cout << "Isosceles triangle" << endl;
    } else {
        cout << "Scalene triangle" << endl;
    }
    
    return 0;
}
```

---

# Flowcharts for Loops

**Looping** means repeating steps. A loop repeats the same steps until a condition is met.

## Types of Loops

### 1. Fixed Loop
Repeats a specific number of times (like "repeat 10 times")

### 2. Variable Loop
Repeats until a condition is met (like "repeat until user types 'stop'")

### Loop Process Includes:

- **Initialize counter** - Set starting value
- **Do the work** - Execute the steps
- **Check condition** - Is it done yet?
- **Update counter** - Move to next step

### Loop Structure Diagram

![Generic Loop Flowchart](material_download.php?f=GENERIC_LOOP_STRUCTURE_FLOWCHART.png)

---

## Example 1: Sum of First N Numbers

### Problem

Find the sum of numbers from 1 to N.

### Steps

1. Start
2. Declare S, N, I
3. Read N
4. Set S (sum) to 0
5. Set I (counter) to 1
6. S = S + I
7. Add 1 to I
8. If I <= N, go back to step 6
9. Print S
10. Stop

### Flowchart

![Sum of N Numbers Flowchart](material_download.php?f=SUM_N_NUMBERS_FLOWCHART.png)

### Try-It: Sum Calculator (C++)

```cpp
#include <iostream>
using namespace std;

int main() {
    int N, I, S = 0;
    
    cout << "Enter N: ";
    cin >> N;
    
    for (I = 1; I <= N; I++) {
        S = S + I;
    }
    
    cout << "Sum = " << S << endl;
    
    return 0;
}
```

---

## Example 2: Character Input Loop

### Problem

Keep reading characters until the user types 'Z', then print "END".

### Steps

1. Start
2. Declare C
3. Read C
4. If C != 'Z', go back to step 3
5. Print "END"
6. Stop

### Flowchart

![Character Input Loop Flowchart](material_download.php?f=CHARACTER_INPUT_LOOP_FLOWCHART.png)

### Try-It: Character Input Loop (C++)

```cpp
#include <iostream>
using namespace std;

int main() {
    char C;
    
    do {
        cout << "Enter a character: ";
        cin >> C;
    } while (C != 'Z');
    
    cout << "END" << endl;
    
    return 0;
}
```

---

## Example 3: Even Numbers from 1 to 50

### Problem

Find and print all even numbers from 1 to 50.

### Steps

1. Start
2. Set I = 1
3. If I > 50, go to step 8
4. Calculate remainder = I % 2
5. If remainder == 0, print I
6. Add 1 to I
7. Go back to step 3
8. Stop

### Flowchart

![Even Numbers 1-50 Flowchart](material_download.php?f=EVEN_NUMBERS_1_50_FLOWCHART.png)

### Try-It: Even Numbers 1-50 (C++)

```cpp
#include <iostream>
using namespace std;

int main() {
    int I;
    
    for (I = 1; I <= 50; I++) {
        if (I % 2 == 0) {
            cout << I << " ";
        }
    }
    cout << endl;
    
    return 0;
}
```

---

## Summary

- **Flowchart** = Visual diagram showing program steps
- **Symbols** = Different shapes for different actions (oval=start/stop, rectangle=process, diamond=decision, parallelogram=input/output)
- **Guidelines** = One start, one stop, flow top-to-bottom, arrows don't cross
- **Decision-making** = Uses diamond shape to ask questions and choose paths
- **Loops** = Repeat steps until condition is met
- Flowcharts help organize ideas and make programs easier to understand


