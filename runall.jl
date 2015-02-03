## run files from ./test directory of same level as original notebook
## files
files = readdir("test")

## run from within test to not mess with data paths
cd("test")

for f in files
    println("--------------------")
    println("Running $f... from $(pwd())")
    println("--------------------")
    ## although prefix test seems to be wrong it works
    include(string("test/", f))
end
