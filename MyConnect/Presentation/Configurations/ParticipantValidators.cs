namespace Presentation.Configurations;

public static class ParticipantValidators
{
    public static IRuleBuilderOptions<T, V> ShouldHaveValue<T, V>(this IRuleBuilder<T, V> ruleBuilder)
    {
        return ruleBuilder.NotEmpty().WithMessage("Participants should not be empty");
    }

    public static IRuleBuilderOptions<T, IList<string>> ShouldHaveContactId<T>(this IRuleBuilder<T, IList<string>> ruleBuilder)
    {
        return ruleBuilder.Must(q => q.All(w => !string.IsNullOrEmpty(w))).WithMessage("ContactId should not be empty");
    }

    public static IRuleBuilderOptions<T, IList<string>> ShouldNotHaveDuplicatedContactId<T>(this IRuleBuilder<T, IList<string>> ruleBuilder)
    {
        return ruleBuilder.Must(q => !q.GroupBy(w => w).Any(q => q.Count() > 1)).WithMessage("ContactId should not be duplicated");
    }
}