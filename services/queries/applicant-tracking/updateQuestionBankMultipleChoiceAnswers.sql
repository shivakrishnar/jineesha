update ATQuestionBankMultipleChoiceAnswers set
	ATQuestionBankID = @ATQuestionBankID,
	Answer = @Answer
where
	ID = @ID