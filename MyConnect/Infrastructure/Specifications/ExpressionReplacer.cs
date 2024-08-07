namespace Infrastructure.Specifications;

public class ExpressionReplacer : ExpressionVisitor
{
    private readonly Expression _oldExpr;
    private readonly Expression _newExpr;

    public ExpressionReplacer(Expression oldExpr, Expression newExpr)
    {
        _oldExpr = oldExpr;
        _newExpr = newExpr;
    }

    public override Expression Visit(Expression node)
    {
        return node == _oldExpr ? _newExpr : base.Visit(node);
    }
}