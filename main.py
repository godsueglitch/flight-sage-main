from hyperon import MeTTa

metta = MeTTa()

#Add local and international flight routes
metta.run("""
    ! (route Nairobi Mombasa flight)
    ! (route Nairobi Kisumu bus)
    ! (route Nairobi Eldoret flight)
    ! (route Nairobi Kigali flight)
    ! (route Nairobi London flight)
    ! (route Nairobi New_York flight)
    ! (route Nairobi Dubai flight)
    ! (route Nairobi Addis_Ababa flight)
    ! (route Mombasa Zanzibar ferry)
    ! (route Dubai Sydney flight)
    ! (route London Paris train)

    ! (previous_travel_user1 Nairobi Dubai)
    ! (previous_travel_user1 Dubai Sydney)

    ! (preferred_mode user1 flight)
""")

#Infer best next destinations based on previous routes
print("Previous travel path:")
results = metta.run("(previous_travel_user1 fromto)")
for r in results:
    print(r)

#Recommend next international destination not yet visited
print("\nRecommended new international flight routes for user1 from Nairobi:")
recommendations = metta.run("""
    (route Nairobi dest flight)
    (not (previous_travel_user1 Nairobidest))
""")

#for rec in recommendations:from hyperon import MeTTa

