# UC-14 — Edit Profile

## Actor
Authenticated user

## Description
Update profile information: display name, height, age, personal target weight.

## Editable Fields
| Field                  | Constraints                            |
|------------------------|----------------------------------------|
| display_name           | Required, non-empty                    |
| height_inches          | Positive integer                       |
| age                    | Positive integer, optional             |
| personal_target_weight | Positive decimal, optional (solo goal) |

## Notes
- Height cannot be changed while in an active challenge (it affects
  safety rail calculations for the committed goal)
- Personal target weight is for solo tracking only — has no effect on
  challenge scoring

## References
- Screen: [SCR-PROFILE](../screens/SCR-PROFILE.md)
- Entity: [ENT-USER](../entities/ENT-USER.md)
