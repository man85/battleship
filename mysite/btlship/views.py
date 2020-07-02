from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.template import loader
from .forms import UserForm
from django.contrib.auth import authenticate,login
from .models import Clients

def index(request):
    if request.method == 'POST':
        form=UserForm(request.POST)
        if form.is_valid():
            user=authenticate(username=form.cleaned_data['username'],password=form.cleaned_data['password'])
            if user is not None:
                if user.is_active:
                    login(request,user)
                    return listusers(request)
                else:
                    return HttpResponse('Account disable') 
            else:
                return render(request,'btlship/index.html',{'form':form, 'msg':'Invalid login, try login  or register '})
    else:
       form = UserForm()
    return render(request,'btlship/index.html',{'form':form})
    
def register(request):
   if request.method== 'POST':
       form=UserForm(request.POST)
       if form.is_valid():
           user=User.objects.create_user(username=form.cleaned_data['username'],password=form.cleaned_data['password'])
           user.save()
           return redirect('index')
   else:
       form=UserForm()
   return render(request,'btlship/register.html',{'form':form})
def listusers(request):
   if request.user.is_authenticated:
      users=Clients.objects.only("user").exclude(user=request.user)
      return render(request,'btlship/listusers.html',{'listusers':users,'curUser':request.user})
   else:
      return redirect('login') 
# Create your views here.
