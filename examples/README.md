# Sample pairs

Open `index.html` and choose the samples, or enter these colors manually.

| Text | Background | Expected result |
| --- | --- | --- |
| `#000000` | `#FFFFFF` | 21:1; all four text thresholds pass |
| `#FFFFFF` | `#000000` | Same ratio and outcomes; reversed preview |
| `#777777` | `#FFFFFF` | About 4.48:1; AA normal fails, AA large passes, AAA normal/large fail |
| `#AAAAAA` | `#FFFFFF` | Below 3:1; all four thresholds fail |
| `#183A37` | `#F5F1E8` | Default ink/paper sample; all four thresholds pass |
| `#123456` | `#123456` | 1:1; all four thresholds fail |

`#abc` expands to `#AABBCC`. Inputs such as `red`, `#abcd`, `#11223344`, `rgb(0,0,0)` and empty strings are rejected, with no active verdict or specimen. Correct either field to recover once both are valid.

A passing pair does not certify a site. Use the size-appropriate threshold and inspect actual rendering as well as the numeric result.
