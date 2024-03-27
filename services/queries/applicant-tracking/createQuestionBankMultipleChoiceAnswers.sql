insert into ATQuestionBankMultipleChoiceAnswers(
	ATQuestionBankID,
	Answer
) values (
	@ATQuestionBankID,
	@Answer
)
select SCOPE_IDENTITY() as ID