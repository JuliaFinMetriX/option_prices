
@time include("startup_script.jl")

mnyness = readtable("../data/rel_data/mnyness.csv")
@time convertColToDates!(mnyness, :Date);

impliedVolas = readtable("../data/rel_data/implVola.csv")
@time convertColToDates!(impliedVolas, :Date);

head(mnyness)

head(impliedVolas)
