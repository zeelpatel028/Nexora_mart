from typing import Dict
from .base_rule import BaseCategoryRule
from .medical_rules import MedicalRules
from .clothing_rules import ClothingRules
from .electronics_rules import ElectronicsRules
from .footwear_rules import FootwearRules
from .grocery_rules import GroceryRules
from .vegetable_fruit_rules import VegetableFruitRules

class CategoryRuleRegistry:
    """
    Dynamic Registry for Category Rules.
    Allows registering custom rules for any category without modifying existing system components.
    Falls back gracefully to BaseCategoryRule for any new category added in the future!
    """
    _rules: Dict[str, BaseCategoryRule] = {}
    _default_rule = BaseCategoryRule()

    @classmethod
    def register(cls, rule: BaseCategoryRule):
        cls._rules[rule.code] = rule

    @classmethod
    def get_rule_for_category(cls, category_code: str) -> BaseCategoryRule:
        return cls._rules.get(category_code.lower(), cls._default_rule)

# Initialize registry with standard rules
CategoryRuleRegistry.register(MedicalRules())
CategoryRuleRegistry.register(ClothingRules())
CategoryRuleRegistry.register(ElectronicsRules())
CategoryRuleRegistry.register(FootwearRules())
CategoryRuleRegistry.register(GroceryRules())
CategoryRuleRegistry.register(VegetableFruitRules())

