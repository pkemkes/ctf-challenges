import subprocess


def eval_expression(expression: str) -> str:
	try:
		return eval(expression)
	except Exception as e:
		return f"Error: {str(e)}"