import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { TokenStorageService } from './../services/token-storage.service';
@Directive({
    selector: '[appPermission]'
})
export class PermissionDirective implements OnInit {
    @Input() appPolicy!: string;

    constructor(private el: ElementRef, private tokenService: TokenStorageService) {

    }
    ngOnInit() {
        const loggedInUser = this.tokenService.getUser();
        if (loggedInUser) {
            const listPermission = Array.isArray(loggedInUser.permissions)
                ? loggedInUser.permissions
                : [];
            if (listPermission.includes(this.appPolicy)) {
                this.el.nativeElement.style.display = "";
            } else {
                this.el.nativeElement.style.display = "none";
            }
        }
        else {
            this.el.nativeElement.style.display = "none";
        }
    }
}