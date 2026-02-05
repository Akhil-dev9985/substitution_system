const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DEFAULT_PERIODS = [
  { id: "P1", label: "08:00 - 08:45" },
  { id: "P2", label: "08:45 - 09:30" },
  { id: "P3", label: "09:45 - 10:30" },
  { id: "P4", label: "10:30 - 11:15" },
  { id: "P5", label: "11:30 - 12:15" },
  { id: "P6", label: "12:15 - 01:00" },
  { id: "P7", label: "01:45 - 02:30" },
  { id: "P8", label: "02:30 - 03:15" }
];
const VITALIS_PERIODS = [
  { id: "P0", label: "08:40 - 09:10" },
  { id: "P1", label: "09:10 - 09:50" },
  { id: "P2", label: "09:50 - 10:30" },
  { id: "P3", label: "10:40 - 11:20" },
  { id: "P4", label: "11:20 - 12:00" },
  { id: "P5", label: "12:00 - 12:40" },
  { id: "P6", label: "01:20 - 02:00" },
  { id: "P7", label: "02:00 - 02:40" },
  { id: "P8", label: "02:40 - 03:20" }
];

export const timetables = {
  vitalis: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    periods: VITALIS_PERIODS,
    teacherTimetable: {
        "VD": {
          "Mon": {
            "P0": "FREE",
            "P1": "5",
            "P2": "6",
            "P3": "FREE",
            "P4": "4",
            "P5": "FREE",
            "P6": "3",
            "P7": "7",
            "P8": "6"
          },
          "Tue": {
            "P0": "7",
            "P1": "5",
            "P2": "FREE",
            "P3": "6",
            "P4": "5",
            "P5": "FREE",
            "P6": "4",
            "P7": "3",
            "P8": "7"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "7",
            "P2": "4",
            "P3": "5",
            "P4": "7",
            "P5": "FREE",
            "P6": "6",
            "P7": "3",
            "P8": "3"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "7",
            "P2": "6",
            "P3": "FREE",
            "P4": "5",
            "P5": "FREE",
            "P6": "3",
            "P7": "5",
            "P8": "4"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "5",
            "P3": "FREE",
            "P4": "6",
            "P5": "4",
            "P6": "4",
            "P7": "7",
            "P8": "3"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "7",
            "P2": "6",
            "P3": "5",
            "P4": "4",
            "P5": "3",
            "P6": "7",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "SG": {
          "Mon": {
            "P0": "4,5",
            "P1": "7",
            "P2": "3",
            "P3": "6",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "4",
            "P7": "5",
            "P8": "7"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "4",
            "P2": "4",
            "P3": "7",
            "P4": "3",
            "P5": "6",
            "P6": "3",
            "P7": "5",
            "P8": "FREE"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "5",
            "P2": "6",
            "P3": "3",
            "P4": "FREE",
            "P5": "7",
            "P6": "FREE",
            "P7": "4",
            "P8": "5"
          },
          "Thu": {
            "P0": "4,5",
            "P1": "5",
            "P2": "3",
            "P3": "6",
            "P4": "FREE",
            "P5": "4",
            "P6": "6",
            "P7": "7",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "4,5",
            "P1": "FREE",
            "P2": "7",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "6",
            "P6": "3",
            "P7": "5",
            "P8": "4"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "5",
            "P2": "7",
            "P3": "6",
            "P4": "3",
            "P5": "4",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "ER": {
          "Mon": {
            "P0": "3",
            "P1": "3",
            "P2": "4",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "7",
            "P6": "FREE",
            "P7": "6",
            "P8": "5"
          },
          "Tue": {
            "P0": "3",
            "P1": "7",
            "P2": "7",
            "P3": "5",
            "P4": "FREE",
            "P5": "3",
            "P6": "6",
            "P7": "FREE",
            "P8": "4"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "3",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "4",
            "P5": "FREE",
            "P6": "7",
            "P7": "5",
            "P8": "6"
          },
          "Thu": {
            "P0": "3",
            "P1": "3",
            "P2": "7",
            "P3": "FREE",
            "P4": "6",
            "P5": "FREE",
            "P6": "4",
            "P7": "FREE",
            "P8": "5"
          },
          "Fri": {
            "P0": "3",
            "P1": "FREE",
            "P2": "4",
            "P3": "FREE",
            "P4": "5",
            "P5": "7",
            "P6": "6",
            "P7": "3",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "3",
            "P2": "4",
            "P3": "7",
            "P4": "5",
            "P5": "6",
            "P6": "3",
            "P7": "FREE",
            "P8": "3"
          }
        },
        "JJ": {
          "Mon": {
            "P0": "6,7",
            "P1": "6",
            "P2": "7",
            "P3": "5",
            "P4": "5",
            "P5": "3",
            "P6": "FREE",
            "P7": "4",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "6",
            "P1": "3",
            "P2": "3",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "4",
            "P6": "5",
            "P7": "7",
            "P8": "6"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "6",
            "P2": "7",
            "P3": "4",
            "P4": "6",
            "P5": "5",
            "P6": "3",
            "P7": "FREE",
            "P8": "4"
          },
          "Thu": {
            "P0": "6,7",
            "P1": "6",
            "P2": "7",
            "P3": "FREE",
            "P4": "7",
            "P5": "3",
            "P6": "5",
            "P7": "4",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "6,7",
            "P1": "FREE",
            "P2": "3",
            "P3": "FREE",
            "P4": "4",
            "P5": "FREE",
            "P6": "7",
            "P7": "6",
            "P8": "5"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "6",
            "P2": "3",
            "P3": "4",
            "P4": "7",
            "P5": "5",
            "P6": "6",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "ML": {
          "Mon": {
            "P0": "FREE",
            "P1": "4",
            "P2": "5",
            "P3": "7",
            "P4": "FREE",
            "P5": "6",
            "P6": "FREE",
            "P7": "3",
            "P8": "3"
          },
          "Tue": {
            "P0": "5",
            "P1": "6",
            "P2": "FREE",
            "P3": "3",
            "P4": "6",
            "P5": "7",
            "P6": "FREE",
            "P7": "4",
            "P8": "5"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "4",
            "P2": "3",
            "P3": "6",
            "P4": "5",
            "P5": "FREE",
            "P6": "4",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "4",
            "P2": "FREE",
            "P3": "7",
            "P4": "3",
            "P5": "5",
            "P6": "FREE",
            "P7": "6",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "3",
            "P6": "5",
            "P7": "4",
            "P8": "6"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "4",
            "P2": "5",
            "P3": "3",
            "P4": "6",
            "P5": "7",
            "P6": "5",
            "P7": "FREE",
            "P8": "5"
          }
        },
        "MP": {
          "Mon": {
            "P0": "FREE",
            "P1": "4",
            "P2": "5",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "6",
            "P6": "7",
            "P7": "3",
            "P8": "3"
          },
          "Tue": {
            "P0": "4",
            "P1": "6",
            "P2": "FREE",
            "P3": "3",
            "P4": "6",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "4",
            "P8": "5"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "4",
            "P2": "3",
            "P3": "6",
            "P4": "5",
            "P5": "FREE",
            "P6": "4",
            "P7": "FREE",
            "P8": "7"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "4",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "3",
            "P5": "5",
            "P6": "FREE",
            "P7": "6",
            "P8": "7"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "3",
            "P6": "5",
            "P7": "4",
            "P8": "6"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "4",
            "P2": "5",
            "P3": "3",
            "P4": "6",
            "P5": "FREE",
            "P6": "4",
            "P7": "FREE",
            "P8": "4"
          }
        },
        "AB": {
          "Mon": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "6",
            "P7": "1",
            "P8": "4"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "1",
            "P3": "4",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "7",
            "P7": "2",
            "P8": "3"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "5",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "6",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "4",
            "P3": "5",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "7",
            "P7": "3",
            "P8": "6"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "3",
            "P5": "5",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "7"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "2",
            "P6": "3",
            "P7": "3",
            "P8": "3"
          }
        },
        "NR": {
          "Mon": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "5",
            "P7": "PP1",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "PP2",
            "P4": "7",
            "P5": "2",
            "P6": "FREE",
            "P7": "6",
            "P8": "PP1"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "3",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "PP2",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "4",
            "P5": "1",
            "P6": "2",
            "P7": "PP1",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "HH",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "1",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "5",
            "P7": "5",
            "P8": "5"
          }
        },
        "PJ": {
          "Mon": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "PP!",
            "P3": "FREE",
            "P4": "PP2",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "6",
            "P3": "NUR",
            "P4": "1",
            "P5": "5",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "7",
            "P4": "FREE",
            "P5": "2",
            "P6": "FREE",
            "P7": "PP1",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "NUR",
            "P3": "4",
            "P4": "PP2",
            "P5": "2",
            "P6": "FREE",
            "P7": "1",
            "P8": "3"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "Karate",
            "P2": "Karate",
            "P3": "HH",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "Pool Time",
            "P8": "Pool Time"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "4",
            "P7": "4",
            "P8": "4"
          }
        },
        "DA": {
          "Mon": {
            "P0": "NUR",
            "P1": "NUR",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "2",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "NUR",
            "P1": "NUR",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "4",
            "P5": "NUR",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "NUR",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "1",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "NUR",
            "P1": "NUR",
            "P2": "5",
            "P3": "3",
            "P4": "FREE",
            "P5": "7",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "NUR",
            "P1": "NUR",
            "P2": "6",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "NUR",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "6",
            "P7": "6",
            "P8": "6"
          }
        },
        "KM": {
          "Mon": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "3-MS",
            "P5": "4-MS",
            "P6": "1-2ndL",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "5-MS",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "1-2ndL",
            "P7": "FREE",
            "P8": "2-2ndL"
          },
          "Wed": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "1-3rdL,PP2-2ndL",
            "P7": "2-3rdL",
            "P8": "2-2ndL"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "6-GK",
            "P6": "1-2ndL",
            "P7": "2-3rdL",
            "P8": "2-2ndL"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "7-GK",
            "P5": "FREE",
            "P6": "1-3rdL,PP2-2ndL",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "7",
            "P7": "7",
            "P8": "7"
          }
        },
        "D_M_K": {
          "Mon": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "1,2",
            "P3": "3,4",
            "P4": "6,7",
            "P5": "5",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "PP1,PP2"
          },
          "Tue": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Wed": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "NUR-PP2",
            "P3": "1",
            "P4": "2",
            "P5": "3,4",
            "P6": "5",
            "P7": "6,7",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "FREE",
            "P1": "3-7",
            "P2": "PP2-Grd2",
            "P3": "3-7",
            "P4": "FREE",
            "P5": "Nur-Pool",
            "P6": "FREE",
            "P7": "1-2/PP1-2_pool",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          }
        }
      },
    classTimetable: {
        "NUR": {
          "Mon": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Eng-Prac",
            "P3": "Eng-CW",
            "P4": "EVS",
            "P5": "EVS",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Tue": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Math-prac",
            "P3": "Games",
            "P4": "EVS",
            "P5": "EVS",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Music",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "Math-Prac",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Thu": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Games",
            "P3": "Math-Prac",
            "P4": "Math-CW",
            "P5": "EVS",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Fri": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Eng-Prac",
            "P3": "Eng-CW",
            "P4": "EVS",
            "P5": "EVS/Pool",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "PP1": {
          "Mon": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Games",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "EVS-Prac",
            "P6": "NAP TIME/ ACTIVITIES",
            "P7": "A&C",
            "P8": "Dance"
          },
          "Tue": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Math-Prac",
            "P3": "Math-CW",
            "P4": "EVS-Act",
            "P5": "EVS-CW",
            "P6": "FREE",
            "P7": "Eng-Act",
            "P8": "Con/Rhym"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Music",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "EVS-CW",
            "P6": "FREE",
            "P7": "Games",
            "P8": "Math-Act"
          },
          "Thu": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Math-Prac",
            "P3": "Math-CW",
            "P4": "Eng-CW",
            "P5": "EVS-Prac",
            "P6": "FREE",
            "P7": "A&C",
            "P8": "Con/Rhym"
          },
          "Fri": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Eng-Prac",
            "P3": "Eng-CW",
            "P4": "EVS-Act",
            "P5": "EVS-CW/Pool",
            "P6": "FREE",
            "P7": "Math-Act",
            "P8": "Math-CW"
          },
          "Sat": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "PP2": {
          "Mon": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Eng-Prac",
            "P3": "Eng-CW",
            "P4": "Games",
            "P5": "Math-Prac",
            "P6": "Math-CW",
            "P7": "EVS",
            "P8": "Dance"
          },
          "Tue": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "EVS",
            "P3": "A&C",
            "P4": "Math-Prac",
            "P5": "Math-CW",
            "P6": "Eng-Prac",
            "P7": "Eng-CW",
            "P8": "Revision"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Music",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "EVS",
            "P6": "2nd Lang",
            "P7": "A&C",
            "P8": "Revision"
          },
          "Thu": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Math-Prac",
            "P3": "Math-CW",
            "P4": "Games",
            "P5": "Eng-Prac",
            "P6": "Eng-CW",
            "P7": "EVS",
            "P8": "Revision"
          },
          "Fri": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Karate",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "EVS/Pool",
            "P6": "2nd Lang",
            "P7": "Math-Prac",
            "P8": "Math-CW"
          },
          "Sat": {
            "P0": "FREE",
            "P1": "FREE",
            "P2": "FREE",
            "P3": "FREE",
            "P4": "FREE",
            "P5": "FREE",
            "P6": "FREE",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "I": {
          "Mon": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Dance",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "EVS-Act",
            "P6": "2nd Lang",
            "P7": "Comp",
            "P8": "EVS-CW"
          },
          "Tue": {
            "P0": "Math-Prac",
            "P1": "Math-CW",
            "P2": "Comp",
            "P3": "EVS-Prac",
            "P4": "Games",
            "P5": "EVS-CW",
            "P6": "2nd Lang",
            "P7": "Eng-Act",
            "P8": "Eng-CW"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Eng-Prac",
            "P3": "Music",
            "P4": "Math-Act",
            "P5": "LIB",
            "P6": "3rd Lang",
            "P7": "EVS-Act",
            "P8": "EVS-CW"
          },
          "Thu": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Math-Prac",
            "P3": "Eng-Prac",
            "P4": "Eng-CW",
            "P5": "A&C",
            "P6": "2nd Lang",
            "P7": "Games",
            "P8": "EVS-CW"
          },
          "Fri": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Karate",
            "P3": "Math-Prac",
            "P4": "Math-Act",
            "P5": "EVS-Act",
            "P6": "3rd Land",
            "P7": "EVS/Pool Time",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Math-Prac",
            "P3": "A&C",
            "P4": "Eng-CW",
            "P5": "EVS-Act",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "II": {
          "Mon": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Dance",
            "P3": "Eng-Act",
            "P4": "Eng-CW",
            "P5": "LIB",
            "P6": "Math-Act",
            "P7": "EVS-Act",
            "P8": "EVS-CW"
          },
          "Tue": {
            "P0": "Math-Prac",
            "P1": "Math-CW",
            "P2": "EVS-Act",
            "P3": "EVS-CW",
            "P4": "Eng-Prac",
            "P5": "A&C",
            "P6": "Eng-Act",
            "P7": "Comp",
            "P8": "2nd Lang"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Math-Act",
            "P3": "Math-CW",
            "P4": "Music",
            "P5": "Games",
            "P6": "EVS-CW",
            "P7": "3rd Lang",
            "P8": "2nd Lang"
          },
          "Thu": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Eng-CW",
            "P3": "Math-Act",
            "P4": "Math-Cw",
            "P5": "Games",
            "P6": "EVS-CW",
            "P7": "3rd Lang",
            "P8": "2nd Lang"
          },
          "Fri": {
            "P0": "CircleT",
            "P1": "CircleT",
            "P2": "Karate",
            "P3": "Math-Act",
            "P4": "Math-CW",
            "P5": "Eng-Act",
            "P6": "Eng-CW",
            "P7": "EVS/ Pool Time",
            "P8": "FREE"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "Assembly",
            "P2": "Math-CW",
            "P3": "Eng-Act",
            "P4": "Eng-CW",
            "P5": "Comp",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "III": {
          "Mon": {
            "P0": "Conv",
            "P1": "SSt",
            "P2": "Sci",
            "P3": "Dance",
            "P4": "MS",
            "P5": "Eng",
            "P6": "Maths",
            "P7": "Hind/Tel",
            "P8": "Tel"
          },
          "Tue": {
            "P0": "Read/Writ",
            "P1": "Eng",
            "P2": "Eng",
            "P3": "Hind/Tel",
            "P4": "Sci",
            "P5": "SSt",
            "P6": "Sci",
            "P7": "Math",
            "P8": "Comp"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "SSt",
            "P2": "Hind/Tel",
            "P3": "Sci",
            "P4": "A&C",
            "P5": "Music",
            "P6": "Eng",
            "P7": "Maths",
            "P8": "Maths"
          },
          "Thu": {
            "P0": "Conv",
            "P1": "SSt",
            "P2": "Sci",
            "P3": "LIB",
            "P4": "Hind/Tel",
            "P5": "Eng",
            "P6": "Maths",
            "P7": "Comp",
            "P8": "Games"
          },
          "Fri": {
            "P0": "Conv",
            "P1": "Karate",
            "P2": "Eng",
            "P3": "HH",
            "P4": "Comp",
            "P5": "Hind/Tel",
            "P6": "Sci",
            "P7": "SSt",
            "P8": "Maths"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "SSt",
            "P2": "Eng",
            "P3": "Hind/Tel",
            "P4": "Sci",
            "P5": "Maths",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "IV": {
          "Mon": {
            "P0": "Conv",
            "P1": "Hind/Tel",
            "P2": "SSt",
            "P3": "Dance",
            "P4": "Maths",
            "P5": "MS",
            "P6": "Sci",
            "P7": "Eng",
            "P8": "Comp"
          },
          "Tue": {
            "P0": "Read/Writ",
            "P1": "Science",
            "P2": "Sci",
            "P3": "Comp",
            "P4": "LIB",
            "P5": "Eng",
            "P6": "Maths",
            "P7": "Hind/Tel",
            "P8": "SSt"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Hind/Tel",
            "P2": "Maths",
            "P3": "Eng",
            "P4": "SSt",
            "P5": "Music",
            "P6": "Hindi",
            "P7": "Sci",
            "P8": "Eng"
          },
          "Thu": {
            "P0": "Conv",
            "P1": "Hind/Tel",
            "P2": "Comp",
            "P3": "Games",
            "P4": "A&C",
            "P5": "Sci",
            "P6": "SSt",
            "P7": "Eng",
            "P8": "Maths"
          },
          "Fri": {
            "P0": "Conv",
            "P1": "Karate",
            "P2": "SSt",
            "P3": "HH",
            "P4": "Eng",
            "P5": "Maths",
            "P6": "Maths",
            "P7": "Hind/Tel",
            "P8": "Sci"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "Hind/Tel",
            "P2": "SSt",
            "P3": "Eng",
            "P4": "Maths",
            "P5": "Sci",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "V": {
          "Mon": {
            "P0": "Conv",
            "P1": "Maths",
            "P2": "Hind/Tel",
            "P3": "Eng",
            "P4": "Eng",
            "P5": "Dance",
            "P6": "a&C",
            "P7": "Sci",
            "P8": "SSt"
          },
          "Tue": {
            "P0": "Read/Writ",
            "P1": "Maths",
            "P2": "MS",
            "P3": "SSt",
            "P4": "Maths",
            "P5": "Games",
            "P6": "Eng",
            "P7": "Sci",
            "P8": "Hind/Tel"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Sci",
            "P2": "Comp",
            "P3": "Maths",
            "P4": "Hind/Tel",
            "P5": "Eng",
            "P6": "Music",
            "P7": "SSt",
            "P8": "Sci"
          },
          "Thu": {
            "P0": "Conv",
            "P1": "Sci",
            "P2": "LIB",
            "P3": "Comp",
            "P4": "Maths",
            "P5": "Hind/Tel",
            "P6": "Eng",
            "P7": "Maths",
            "P8": "SSt"
          },
          "Fri": {
            "P0": "Conv",
            "P1": "Karate",
            "P2": "Maths",
            "P3": "HH",
            "P4": "SSt",
            "P5": "Comp",
            "P6": "Hind/Tel",
            "P7": "Sci",
            "P8": "Eng"
          },
          "Sat": {
            "P0": "Asembly",
            "P1": "Sci",
            "P2": "Hind/Tel",
            "P3": "Maths",
            "P4": "SSt",
            "P5": "Eng",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "VI": {
          "Mon": {
            "P0": "Conv",
            "P1": "Eng",
            "P2": "Maths",
            "P3": "Sci",
            "P4": "Dance",
            "P5": "Hind/Tel",
            "P6": "Comp",
            "P7": "SSt",
            "P8": "Maths"
          },
          "Tue": {
            "P0": "Read/Writ",
            "P1": "Hindi/Tel",
            "P2": "Games",
            "P3": "Maths",
            "P4": "Hind/Tel",
            "P5": "Sci",
            "P6": "SSt",
            "P7": "A&C",
            "P8": "Eng"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Eng",
            "P2": "Sci",
            "P3": "Hind/Tel",
            "P4": "Eng",
            "P5": "Comp",
            "P6": "Maths",
            "P7": "Music",
            "P8": "SSt"
          },
          "Thu": {
            "P0": "Conv",
            "P1": "Eng",
            "P2": "Maths",
            "P3": "Sci",
            "P4": "SSt",
            "P5": "GK",
            "P6": "Sci",
            "P7": "Hind/Tel",
            "P8": "Comp"
          },
          "Fri": {
            "P0": "Conv",
            "P1": "Karate",
            "P2": "LIB",
            "P3": "HH",
            "P4": "Maths",
            "P5": "Sci",
            "P6": "SSt",
            "P7": "Eng",
            "P8": "Hind/Tel"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "Eng",
            "P2": "Maths",
            "P3": "Sci",
            "P4": "Hind/Tel",
            "P5": "SSt",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        },
        "VII": {
          "Mon": {
            "P0": "Conv",
            "P1": "Sci",
            "P2": "Eng",
            "P3": "Hindi",
            "P4": "Dance",
            "P5": "SSt",
            "P6": "Tel",
            "P7": "Maths",
            "P8": "Sci"
          },
          "Tue": {
            "P0": "Read/Writ",
            "P1": "SSt",
            "P2": "SSt",
            "P3": "Sci",
            "P4": "A&C",
            "P5": "Hindi",
            "P6": "Comp",
            "P7": "Eng",
            "P8": "Maths"
          },
          "Wed": {
            "P0": "Assembly",
            "P1": "Maths",
            "P2": "Eng",
            "P3": "Games",
            "P4": "Maths",
            "P5": "Sci",
            "P6": "SSt",
            "P7": "Music",
            "P8": "Tel"
          },
          "Thu": {
            "P0": "Conv",
            "P1": "Maths",
            "P2": "SSt",
            "P3": "Hindi",
            "P4": "Eng",
            "P5": "LIB",
            "P6": "Comp",
            "P7": "Sci",
            "P8": "Tel"
          },
          "Fri": {
            "P0": "Conv",
            "P1": "Karate",
            "P2": "Sci",
            "P3": "HH",
            "P4": "GK",
            "P5": "SSt",
            "P6": "Eng",
            "P7": "Maths",
            "P8": "Comp"
          },
          "Sat": {
            "P0": "Assembly",
            "P1": "Maths",
            "P2": "Sci",
            "P3": "SSt",
            "P4": "Eng",
            "P5": "Hindi",
            "P6": "ACTIVITIES",
            "P7": "FREE",
            "P8": "FREE"
          }
        }
      },
    classTeachers: {
        "NUR": {
          "name": "SUVARCHALA DEVI",
          "code": "SD"
        },
        "PP1": {
          "name": "PILLA LALIMA",
          "code": "PL"
        },
        "PP2": {
          "name": "ANURADHA DUTTA",
          "code": "AD"
        },
        "I": {
          "name": "MARY BINDISREE",
          "code": "BS"
        },
        "II": {
          "name": "DIVYAVANI",
          "code": "DV"
        },
        "III": {
          "name": "ESTHER RANI",
          "code": "ER"
        },
        "IV": {
          "name": "M PARVATHI",
          "code": "MP"
        },
        "V": {
          "name": "MURARILAL",
          "code": "ML"
        },
        "VI": {
          "name": "JEEVANA JYOTHI",
          "code": "JJ"
        },
        "VII": {
          "name": "VAMSE DEVATHOTI",
          "code": "VD"
        }
      }
  }
};

export const defaultTimetable = {
  days: DEFAULT_DAYS,
  periods: DEFAULT_PERIODS,
  teacherTimetable: {},
  classTimetable: {}
};

export const getSchoolTimetable = (school) => {
  if (!school) return defaultTimetable;
  const key = school.toString().toLowerCase();
  return timetables[key] || defaultTimetable;
};
