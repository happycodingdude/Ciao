namespace Chat.API.Configuration;

public static class ParticipantValidators
{
    public static IRuleBuilderOptions<T, V> ShouldHaveValue<T, V>(this IRuleBuilder<T, V> ruleBuilder)
    {
        return ruleBuilder.NotEmpty().WithMessage("Participants should not be empty");
    }

    public static IRuleBuilderOptions<T, IList<Guid>> ShouldHaveContactId<T>(this IRuleBuilder<T, IList<Guid>> ruleBuilder)
    {
        return ruleBuilder.Must(q => q.All(w => w != Guid.Empty)).WithMessage("ContactId should not be empty");
    }

    public static IRuleBuilderOptions<T, IList<Guid>> ShouldNotHaveDuplicatedContactId<T>(this IRuleBuilder<T, IList<Guid>> ruleBuilder)
    {
        return ruleBuilder.Must(q => !q.GroupBy(w => w).Any(q => q.Count() > 1)).WithMessage("ContactId should not be duplicated");
    }
}