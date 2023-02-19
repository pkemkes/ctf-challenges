from typing import Dict, List
from dataclasses import dataclass, asdict, field
from random import gauss

BASE_A = 50
BASE_B = 500
BASE_C = 5000


@dataclass
class UserData:
    balance: int = 5000
    amount_a: int = 0
    amount_b: int = 0
    amount_c: int = 0
    values_a: List[float] = field(default_factory=lambda: [BASE_A])
    values_b: List[float] = field(default_factory=lambda: [BASE_B])
    values_c: List[float] = field(default_factory=lambda: [BASE_C])

    def balance_str(self):
        return f"{round(self.balance, 2):.2f}"

    def value_str_a(self):
        return f"{round(self.values_a[-1], 2):.2f}"

    def value_str_b(self):
        return f"{round(self.values_b[-1], 2):.2f}"

    def value_str_c(self):
        return f"{round(self.values_c[-1], 2):.2f}"

    def to_dict(self) -> Dict:
        return asdict(self)

    def new_prices(self):
        self.values_a.append(
            abs(round(gauss(self.values_a[-1], BASE_A/10), 2))
        )
        self.values_b.append(
            abs(round(gauss(self.values_b[-1], BASE_B/10), 2))
        )
        self.values_c.append(
            abs(round(gauss(self.values_c[-1], BASE_C/10), 2))
        )

    def stocks_value(self) -> float:
        return (
            self.amount_a * self.values_a[-1] +
            self.amount_b * self.values_b[-1] +
            self.amount_c * self.values_c[-1]
        )
